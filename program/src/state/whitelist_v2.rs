use anchor_lang::prelude::*;
use mpl_token_metadata::types::{Collection, Creator};
use tensor_toolbox::validate_proof;
use vipers::throw_err;

use crate::{error::ErrorCode, state::FullMerkleProof};

// (!) INCLUSIVE of discriminator (8 bytes)
#[constant]
#[allow(clippy::identity_op)]
pub const WHITELIST_V2_SIZE: usize = 8 // discriminator
    + 1 // version
    + 1 // bump
    + 32 // uuid
    + 32 // authority
    + 5 * 33; // conditions

#[constant]
pub const WHITELIST_V2_CONDITIONS_LENGTH: usize = 5;

/// Seeds: ["whitelist", <authority>, <uuid>]
#[account]
pub struct WhitelistV2 {
    pub version: u8,
    pub bump: u8,
    pub uuid: [u8; 32],
    pub authority: Pubkey,
    pub conditions: [Condition; WHITELIST_V2_CONDITIONS_LENGTH],
}

impl WhitelistV2 {
    pub const SIZE: usize = WHITELIST_V2_SIZE;

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
            .all(|condition| condition.validate(&collection, &creators, &proof).is_ok());

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
