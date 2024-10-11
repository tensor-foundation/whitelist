use anchor_lang::prelude::*;
use mpl_token_metadata::types::{Collection, Creator};
use tensor_toolbox::validate_proof;
use tensor_vipers::throw_err;

use crate::{error::ErrorCode, state::FullMerkleProof};

use super::DISCRIMINATOR_SIZE;

/// Whitelist V2 size constant, a separate const so it can be exported into the Anchor IDL.
#[constant]
pub const WHITELIST_V2_BASE_SIZE: usize =
      8   // discriminator
    + 1   // version
    + 1   // bump
    + 32  // uuid
    + 1   // state: unfrozen/frozen
    + 32  // update_authority
    + 32  // namespace
    + 32  // freeze_authority
;

/// Maximum number of conditions allowed in a whitelist.
/// Vectors larger than this may hit compute or other limits.
#[constant]
pub const WHITELIST_V2_CONDITIONS_LENGTH: usize = 24;

/// Whitelist V2 state
/// Seeds: `["whitelist", <namespace>, <uuid>]`
///
/// The state account for Whitelist V2. This account stores all the information
/// and values of a Whitelist, including the list of conditions to validate an item against.
#[account]
#[derive(Debug, Default, InitSpace, Eq, PartialEq)]
pub struct WhitelistV2 {
    /// Whitelist version, used to control upgrades.
    pub version: u8,
    /// Bump seed used to derive the PDA.
    pub bump: u8,
    /// Owner-chosen identifier for the whitelist.
    pub uuid: [u8; 32],
    /// Whitelist state--currently either Frozen or Unfrozen.
    pub state: State,
    /// Authority that can update the whitelist.
    pub update_authority: Pubkey,
    /// Namespace for the whitelist to further differentiate it from other whitelists owned by the same authority.
    pub namespace: Pubkey,
    /// Authority that can freeze/unfreeze the whitelist.
    pub freeze_authority: Pubkey,
    /// Whitelist conditions that must be met to validate against the whitelist.
    // We support up to 24 conditions and dynamically allocate the space for them, so the base size should
    // have 0 conditions and we manually calculate the necessary space from there.
    #[max_len(0)]
    pub conditions: Vec<Condition>,
}

impl WhitelistV2 {
    /// Whitelist V2 prefix for seeds.
    pub const PREFIX: &'static [u8] = b"whitelist";

    /// Whitelist base size without without any conditions, but including the conditions vector length.
    pub const BASE_SIZE: usize = DISCRIMINATOR_SIZE + Self::INIT_SPACE;

    /// Whitelist condition size.
    pub const CONDITION_SIZE: usize = 33; // 1 byte mode + 32 bytes pubkey

    /// Determine if a whitelist is frozen.
    pub fn is_frozen(&self) -> bool {
        self.state == State::Frozen
    }

    /// Validate the conditions in the whitelist.
    ///
    /// This function is called when creating or updating a whitelist to ensure the conditions
    /// specified by the caller are valid.
    ///
    /// Only one merkle proof is allowed in the whitelist and it must be the first condition.
    /// This function ensures that the merkle proof is the first condition by swapping it to the front
    /// if necessary.
    ///
    /// Whitelists are expected to be created once, edited seldom, and validated many times, so having
    /// the merkle proof first makes it easier to validate the proof.
    ///
    /// The number of conditions is limited to `WHITELIST_V2_CONDITIONS_LENGTH` to control compute usage.
    pub fn validate_conditions(conditions: &mut [Condition]) -> Result<()> {
        // An empty whitelist does not gatekeep anything.
        if conditions.is_empty() {
            throw_err!(ErrorCode::EmptyConditions);
        }

        if conditions.len() > WHITELIST_V2_CONDITIONS_LENGTH {
            throw_err!(ErrorCode::TooManyConditions);
        }

        // Only one merkle proof per whitelist allowed.
        let merkle_proofs = conditions
            .iter()
            .filter(|c| c.mode == Mode::MerkleTree)
            .count();

        if merkle_proofs > 1 {
            throw_err!(ErrorCode::TooManyMerkleProofs);
        }

        // Ensure the merkle proof is the first item in the vector, if it exists.
        if let Some(index) = conditions
            .iter()
            .enumerate()
            .find(|(_, c)| c.mode == Mode::MerkleTree)
            .map(|(index, _)| index)
        {
            conditions.rotate_left(index);
        }

        Ok(())
    }

    /// Whitelists are made up of a set of conditions of which at least one must be met.
    /// This function verifies that at least one condition is met.
    pub fn verify(
        &self,
        // It is the job of upstream caller to validate collection and creator inputs.
        collection: &Option<Collection>,
        creators: &Option<Vec<Creator>>,
        proof: &Option<FullMerkleProof>,
    ) -> Result<()> {
        // If any pass, then the whitelist is valid.
        // Empty iterators return false.
        let pass = self
            .conditions
            .iter()
            .any(|condition| condition.validate(collection, creators, proof).is_ok());

        // If none pass, then the whitelist is invalid, but we want to return the specific error that failed.
        if !pass {
            let err = self
                .conditions
                .iter()
                .find_map(|condition| condition.validate(collection, creators, proof).err())
                .unwrap_or_else(|| ErrorCode::EmptyConditions.into());

            return Err(err);
        }

        Ok(())
    }
}

/// White list state enum. Currently only supports Frozen and Unfrozen.
#[repr(u8)]
#[derive(AnchorDeserialize, AnchorSerialize, Clone, Debug, Default, InitSpace, Eq, PartialEq)]
pub enum State {
    #[default]
    Unfrozen,
    Frozen,
}

/// Defines a whitelist condition that items are checked against.
/// Conditions are made up of a mode and a value.
/// The mode determines what kind of value is present to be validated against.
/// The value is the data used to validate against the whitelist.
///
/// Current modes:
/// - MerkleTree: The value is the root node of a Merkle tree.
/// - VOC: The value is the Metaplex "verified-on-chain"/Metaplex Certified Collection address.
/// - FVC: The value is the first verified creator address of the Metaplex creators metadata.
#[derive(AnchorDeserialize, AnchorSerialize, Clone, Debug, Default, InitSpace, Eq, PartialEq)]
pub struct Condition {
    pub mode: Mode,
    pub value: Pubkey,
}

/// Mode enum for whitelist conditions.
#[repr(u8)]
#[derive(AnchorDeserialize, AnchorSerialize, Clone, Debug, Default, InitSpace, Eq, PartialEq)]
pub enum Mode {
    #[default]
    MerkleTree,
    VOC,
    FVC,
}

impl Condition {
    /// Validate against a condition by providing collection, creators, or proof.
    pub fn validate(
        &self,
        collection: &Option<Collection>,
        creators: &Option<Vec<Creator>>,
        proof: &Option<FullMerkleProof>,
    ) -> Result<()> {
        match self.mode {
            Mode::MerkleTree => {
                if let Some(proof) = proof {
                    if !validate_proof(&self.value.to_bytes(), &proof.leaf, &proof.proof) {
                        throw_err!(ErrorCode::FailedMerkleProofVerification);
                    }
                } else {
                    throw_err!(ErrorCode::FailedMerkleProofVerification);
                }
            }
            Mode::VOC => {
                if let Some(collection) = collection {
                    if !collection.verified {
                        throw_err!(ErrorCode::FailedVocVerification);
                    }
                    if collection.key != self.value {
                        throw_err!(ErrorCode::FailedVocVerification);
                    }
                } else {
                    throw_err!(ErrorCode::FailedVocVerification);
                }
            }
            Mode::FVC => {
                if let Some(creators) = creators {
                    let fvc = creators.iter().find(|c| c.verified);
                    if let Some(fvc) = fvc {
                        if fvc.address != self.value {
                            throw_err!(ErrorCode::FailedFvcVerification);
                        }
                    } else {
                        throw_err!(ErrorCode::FailedFvcVerification);
                    }
                } else {
                    throw_err!(ErrorCode::FailedFvcVerification);
                }
            }
        }
        Ok(())
    }
}

#[cfg(test)]
mod test {
    use super::*;

    use std::collections::HashMap;

    use solana_sdk::{keccak::hash, pubkey::Pubkey};
    use spl_merkle_tree_reference::MerkleTree;

    #[test]
    fn whitelist_verify_fails_on_empty_conditions() {
        let whitelist = WhitelistV2::default();
        assert!(whitelist.conditions.is_empty());

        let err = whitelist.verify(&None, &None, &None).unwrap_err();

        match err {
            Error::AnchorError(anchor_error) => {
                assert_eq!(
                    anchor_error.error_msg.to_string(),
                    ErrorCode::EmptyConditions.to_string()
                );
            }
            Error::ProgramError(_) => {
                panic!("Expected AnchorError, got ProgramError");
            }
        }
    }

    #[test]
    fn whitelist_verify_fails_on_empty_creators() {
        let creator = Pubkey::new_unique();
        let creators = vec![];

        let whitelist = WhitelistV2 {
            conditions: vec![Condition {
                mode: Mode::FVC,
                value: creator,
            }],
            ..Default::default()
        };

        let err = whitelist.verify(&None, &Some(creators), &None).unwrap_err();

        match err {
            Error::AnchorError(anchor_error) => {
                assert_eq!(
                    anchor_error.error_msg.to_string(),
                    ErrorCode::FailedFvcVerification.to_string()
                );
            }
            Error::ProgramError(_) => {
                panic!("Expected AnchorError, got ProgramError");
            }
        }
    }

    #[test]
    fn whitelist_verify_fails_on_unverified_creator() {
        let creator = Pubkey::new_unique();
        let creators = vec![Creator {
            address: creator,
            verified: false,
            share: 100,
        }];

        let whitelist = WhitelistV2 {
            conditions: vec![Condition {
                mode: Mode::FVC,
                value: creator,
            }],
            ..Default::default()
        };

        let err = whitelist.verify(&None, &Some(creators), &None).unwrap_err();

        match err {
            Error::AnchorError(anchor_error) => {
                assert_eq!(
                    anchor_error.error_msg.to_string(),
                    ErrorCode::FailedFvcVerification.to_string()
                );
            }
            Error::ProgramError(_) => {
                panic!("Expected AnchorError, got ProgramError");
            }
        }
    }

    // whiteslist verify fails on empty collection
    #[test]
    fn whitelist_verify_fails_on_empty_collection() {
        let collection = Collection {
            verified: true,
            key: Pubkey::new_unique(),
        };

        // Set the condition to VOC.
        let whitelist = WhitelistV2 {
            conditions: vec![Condition {
                mode: Mode::VOC,
                value: collection.key,
            }],
            ..Default::default()
        };

        // No collection provided
        let err = whitelist.verify(&None, &None, &None).unwrap_err();

        match err {
            Error::AnchorError(anchor_error) => {
                assert_eq!(
                    anchor_error.error_msg.to_string(),
                    ErrorCode::FailedVocVerification.to_string()
                );
            }
            Error::ProgramError(_) => {
                panic!("Expected AnchorError, got ProgramError");
            }
        }
    }

    #[test]
    fn whitelist_verify_fails_on_unverified_collection() {
        let collection = Collection {
            verified: false,
            key: Pubkey::new_unique(),
        };

        let whitelist = WhitelistV2 {
            conditions: vec![Condition {
                mode: Mode::VOC,
                value: collection.key,
            }],
            ..Default::default()
        };

        let err = whitelist
            .verify(&Some(collection), &None, &None)
            .unwrap_err();

        match err {
            Error::AnchorError(anchor_error) => {
                assert_eq!(
                    anchor_error.error_msg.to_string(),
                    ErrorCode::FailedVocVerification.to_string()
                );
            }
            Error::ProgramError(_) => {
                panic!("Expected AnchorError, got ProgramError");
            }
        }
    }

    #[test]
    fn whitelist_verify_fails_on_invalid_voc() {
        let collection = Collection {
            verified: true,
            key: Pubkey::new_unique(),
        };

        let whitelist = WhitelistV2 {
            conditions: vec![Condition {
                mode: Mode::VOC,
                value: Pubkey::new_unique(), // Invalid VOC
            }],
            ..Default::default()
        };

        let err = whitelist
            .verify(&Some(collection), &None, &None)
            .unwrap_err();

        match err {
            Error::AnchorError(anchor_error) => {
                assert_eq!(
                    anchor_error.error_msg.to_string(),
                    ErrorCode::FailedVocVerification.to_string()
                );
            }
            Error::ProgramError(_) => {
                panic!("Expected AnchorError, got ProgramError");
            }
        }
    }

    #[test]
    fn multiple_condition_or_succeeds() {
        let item = Pubkey::new_unique();
        let tree = create_merkle_tree_of_size(2, vec![item]);

        let proof = tree.proofs.get(&item).unwrap();

        let creator = Pubkey::new_unique();
        let creators = vec![Creator {
            address: creator,
            verified: true,
            share: 100,
        }];

        let collection = Collection {
            verified: true,
            key: Pubkey::new_unique(),
        };

        let collection2 = Collection {
            verified: true,
            key: Pubkey::new_unique(),
        };

        let whitelist = WhitelistV2 {
            conditions: vec![
                Condition {
                    mode: Mode::MerkleTree,
                    value: tree.root,
                },
                Condition {
                    mode: Mode::VOC,
                    value: collection.key,
                },
                Condition {
                    mode: Mode::VOC,
                    value: collection2.key,
                },
                Condition {
                    mode: Mode::FVC,
                    value: creator,
                },
            ],
            ..Default::default()
        };

        // Any one of these conditions should pass.
        whitelist
            .verify(&Some(collection.clone()), &None, &None)
            .unwrap();
        whitelist
            .verify(&Some(collection2.clone()), &None, &None)
            .unwrap();
        whitelist
            .verify(&None, &Some(creators.clone()), &None)
            .unwrap();
        whitelist
            .verify(&None, &None, &Some(proof.clone()))
            .unwrap();

        // Combining multiple conditions should pass.
        whitelist
            .verify(
                &Some(collection),
                &Some(creators.clone()),
                &Some(proof.clone()),
            )
            .unwrap();
        whitelist
            .verify(&Some(collection2), &Some(creators), &Some(proof.clone()))
            .unwrap();
    }

    struct TestMerkleTree {
        root: Pubkey,
        proofs: HashMap<Pubkey, FullMerkleProof>,
    }

    fn create_merkle_tree_of_size(size: usize, target_items: Vec<Pubkey>) -> TestMerkleTree {
        // Ensure we don't exceed the specified size
        assert!(
            target_items.len() <= size,
            "Too many target items for the specified tree size"
        );

        // Create leaves for all items (target and filler)
        let target_leaves: Vec<[u8; 32]> = target_items
            .iter()
            .map(|item| hash(item.as_ref()).0)
            .collect();

        let mut leaves: Vec<[u8; 32]> = Vec::with_capacity(size);

        leaves.extend(target_leaves);

        // Fill the remaining leaves to reach the desired size
        while leaves.len() < size {
            leaves.push(hash(&Pubkey::default().to_bytes()).0);
        }

        leaves.sort();

        // Create the Merkle tree
        let tree = MerkleTree::new(&leaves);
        let root = Pubkey::new_from_array(tree.get_root());

        // Generate proofs for target items and store them in a HashMap
        let proofs: HashMap<Pubkey, FullMerkleProof> = target_items
            .iter()
            .map(|item| {
                let leaf = hash(item.as_ref()).0;
                // Consistently compute the index
                let index = leaves
                    .iter()
                    .position(|x| x == &leaf)
                    .expect("Leaf not found in leaves vector");
                let proof = tree.get_proof_of_leaf(index);
                (*item, FullMerkleProof { proof, leaf })
            })
            .collect();

        TestMerkleTree { root, proofs }
    }
}
