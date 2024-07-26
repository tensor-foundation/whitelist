use anchor_lang::prelude::*;
use mpl_token_metadata::types::{Collection, Creator};
use tensor_toolbox::validate_proof;
use vipers::throw_err;

use crate::{error::ErrorCode, state::FullMerkleProof};

/// Whitelist V2 size constant, a separate const so it can be exported into the Anchor IDL.
#[constant]
#[allow(clippy::identity_op)]
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
#[derive(Debug, Default, Eq, PartialEq)]
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
    pub conditions: Vec<Condition>,
}

impl WhitelistV2 {
    /// Whitelist V2 prefix for seeds.
    pub const PREFIX: &'static [u8] = b"whitelist";
    /// Whitelist base size without any conditions.
    pub const BASE_SIZE: usize = WHITELIST_V2_BASE_SIZE;
    /// Whitelist condition size.
    pub const CONDITION_SIZE: usize = std::mem::size_of::<u8>() + std::mem::size_of::<Pubkey>();

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
    /// Whitelists are expected to be created once, editing seldom, and validated many times and having
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
                .unwrap();

            return Err(err);
        }

        Ok(())
    }
}

/// White list state enum. Currently only supports Frozen and Unfrozen.
#[repr(u8)]
#[derive(AnchorDeserialize, AnchorSerialize, Clone, Debug, Default, Eq, PartialEq)]
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
#[derive(AnchorDeserialize, AnchorSerialize, Clone, Debug, Default, Eq, PartialEq)]
pub struct Condition {
    pub mode: Mode,
    pub value: Pubkey,
}

/// Mode enum for whitelist conditions.
#[repr(u8)]
#[derive(AnchorDeserialize, AnchorSerialize, Clone, Debug, Default, Eq, PartialEq)]
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
