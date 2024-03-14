use anchor_lang::prelude::*;
use mpl_token_metadata::types::{Collection, Creator};
use tensor_toolbox::validate_proof;
use vipers::throw_err;

use crate::{error::ErrorCode, state::FullMerkleProof};

// (!) INCLUSIVE of discriminator (8 bytes)
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

#[constant]
pub const WHITELIST_V2_CONDITIONS_LENGTH: usize = 7;

/// Seeds: ["whitelist", <authority>, <uuid>]
#[account]
pub struct WhitelistV2 {
    pub version: u8,
    pub bump: u8,
    pub uuid: [u8; 32],
    pub state: State,
    pub update_authority: Pubkey,
    pub namespace: Pubkey,
    pub freeze_authority: Pubkey,
    pub conditions: Vec<Condition>,
}

impl WhitelistV2 {
    pub const BASE_SIZE: usize = WHITELIST_V2_BASE_SIZE;
    // 33 bytes for Mode + Pubkey
    pub const CONDITION_SIZE: usize = std::mem::size_of::<u8>() + std::mem::size_of::<Pubkey>();

    // Limit the number of conditions to control compute usage.
    pub fn validate_conditions(conditions: &[Condition]) -> Result<()> {
        if conditions.len() > WHITELIST_V2_CONDITIONS_LENGTH {
            throw_err!(ErrorCode::TooManyConditions);
        }

        // Only one merkle proof per whitelist allowed.
        let merkle_proofs = conditions
            .iter()
            .filter(|c| c.mode == Mode::MerkleProof)
            .count();

        if merkle_proofs > 1 {
            throw_err!(ErrorCode::TooManyMerkleProofs);
        }

        Ok(())
    }

    /// Whitelists are made up of a set of conditions of which at least one must be met.
    pub fn verify_whitelist(
        &self,
        // It is the job of upstream caller to validate collection and creator inputs.
        collection: Option<Collection>,
        creators: Option<Vec<Creator>>,
        proof: Option<FullMerkleProof>,
    ) -> Result<()> {
        // If any pass, then the whitelist is valid.
        let pass = self
            .conditions
            .iter()
            .any(|condition| condition.validate(&collection, &creators, &proof).is_ok());

        // If none pass, then the whitelist is invalid, but we want to return the specific error that failed.
        if !pass {
            let err = self
                .conditions
                .iter()
                .find_map(|condition| condition.validate(&collection, &creators, &proof).err())
                .unwrap();

            return Err(err);
        }

        Ok(())
    }
}

#[repr(u8)]
#[derive(AnchorDeserialize, AnchorSerialize, Clone, Debug, PartialEq)]
pub enum State {
    Unfrozen,
    Frozen,
}

#[derive(AnchorDeserialize, AnchorSerialize, Clone, Debug, PartialEq)]
pub struct Condition {
    pub mode: Mode,
    pub value: Pubkey,
}

impl Condition {
    pub fn validate(
        &self,
        collection: &Option<Collection>,
        creators: &Option<Vec<Creator>>,
        proof: &Option<FullMerkleProof>,
    ) -> Result<()> {
        match self.mode {
            Mode::Empty => (),
            Mode::MerkleProof => {
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

#[repr(u8)]
#[derive(AnchorDeserialize, AnchorSerialize, Clone, Debug, PartialEq)]
pub enum Mode {
    Empty,
    VOC,
    FVC,
    MerkleProof,
}
