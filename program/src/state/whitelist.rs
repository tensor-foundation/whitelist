use anchor_lang::prelude::*;
use mpl_token_metadata::{
    accounts::Metadata,
    types::{Collection, Creator},
};
use tensor_toolbox::validate_proof;
use tensor_vipers::throw_err;

use crate::{
    error::ErrorCode,
    state::{FullMerkleProof, ZERO_ARRAY},
};

// (!) INCLUSIVE of discriminator (8 bytes)
#[constant]
#[allow(clippy::identity_op)]
pub const WHITELIST_SIZE: usize = 8 + 1 + 1 + 1 + (32 * 3) + 1 + (33 * 2) + 64;

#[account]
#[derive(Debug, Eq, PartialEq)]
pub struct Whitelist {
    pub version: u8,
    pub bump: u8,
    /// DEPRECATED, doesn't do anything
    pub verified: bool,
    /// in the case when not present will be [u8; 32]
    pub root_hash: [u8; 32],
    pub uuid: [u8; 32],
    pub name: [u8; 32],
    pub frozen: bool,
    pub voc: Option<Pubkey>,
    pub fvc: Option<Pubkey>,
    pub _reserved: [u8; 64],
}

impl Default for Whitelist {
    fn default() -> Self {
        Self {
            version: 0,
            bump: 0,
            verified: false,
            root_hash: ZERO_ARRAY,
            uuid: [0; 32],
            name: [0; 32],
            frozen: false,
            voc: None,
            fvc: None,
            _reserved: [0; 64],
        }
    }
}

impl Whitelist {
    /// Passed in verification method has to match the verification method stored on the whitelist
    /// Passing none of the 3 will result in failure
    pub fn verify_whitelist(
        &self,
        // It is the job of upstream caller to verify that Metadata account passed in is actually correct
        // decided to draw the boundary there coz 1)want to keep mcc/fvc access code here for deduplication, but
        // 2)don't want to be opinionated on how Metadata is verified (anchor / manually / etc)
        metadata: Option<&'_ Metadata>,
        proof: Option<FullMerkleProof>,
    ) -> Result<()> {
        //Priority 1: Merkle proof (because we manually control this = highest priority)
        if self.root_hash != ZERO_ARRAY {
            match proof {
                Some(proof) => {
                    //bad proof verification? fail
                    if !validate_proof(&self.root_hash, &proof.leaf, &proof.proof) {
                        throw_err!(ErrorCode::FailedMerkleProofVerification);
                    }
                }
                //didn't pass in merkle proof? fail
                None => {
                    throw_err!(ErrorCode::FailedMerkleProofVerification);
                }
            }

            return Ok(());
        }

        //Priority 2: VOC
        if self.voc.is_some() {
            match metadata {
                Some(metadata) => {
                    match &metadata.collection {
                        Some(collection) => {
                            //collection not verified? fail
                            if !collection.verified {
                                throw_err!(ErrorCode::FailedVocVerification);
                            }
                            //collection key doesn't match? fail
                            if collection.key != self.voc.unwrap() {
                                throw_err!(ErrorCode::FailedVocVerification);
                            }
                        }
                        //collection not recorded in metadata? fail
                        None => {
                            throw_err!(ErrorCode::FailedVocVerification);
                        }
                    }
                }
                //didn't pass in metadata? fail
                None => {
                    throw_err!(ErrorCode::FailedVocVerification);
                }
            }

            return Ok(());
        }

        //Priority 3: FVC
        if self.fvc.is_some() {
            match metadata {
                Some(metadata) => {
                    match &metadata.creators {
                        Some(creators) => {
                            let mut fvc: Option<Pubkey> = None;
                            for creator in creators {
                                if !creator.verified {
                                    continue;
                                }
                                fvc = Some(creator.address);
                                break;
                            }
                            match fvc {
                                Some(fvc) => {
                                    //fvc doesn't match? fail
                                    if self.fvc.unwrap() != fvc {
                                        throw_err!(ErrorCode::FailedFvcVerification);
                                    }
                                }
                                //failed to find an FVC? fail
                                None => {
                                    throw_err!(ErrorCode::FailedFvcVerification);
                                }
                            }
                        }
                        //no creators array? fail
                        None => {
                            throw_err!(ErrorCode::FailedFvcVerification);
                        }
                    }
                }
                //didn't pass in metadata? fail
                None => {
                    throw_err!(ErrorCode::FailedFvcVerification);
                }
            }

            return Ok(());
        }

        //should never be getting to here
        throw_err!(ErrorCode::BadWhitelist);
    }

    pub fn verify_whitelist_tcomp(
        &self,
        collection: Option<Collection>,
        creators: Option<Vec<Creator>>,
    ) -> Result<()> {
        //Priority 1: Merkle proof (because we manually control this = highest priority)
        if self.root_hash != ZERO_ARRAY {
            // TODO: currently unsupported for tcomp
            throw_err!(ErrorCode::FailedMerkleProofVerification);
        }

        //Priority 2: VOC
        if self.voc.is_some() {
            match collection {
                Some(collection) => {
                    //collection not verified? fail
                    if !collection.verified {
                        throw_err!(ErrorCode::FailedVocVerification);
                    }
                    //collection key doesn't match? fail
                    if collection.key != self.voc.unwrap() {
                        throw_err!(ErrorCode::FailedVocVerification);
                    }
                }
                //didn't pass in metadata? fail
                None => {
                    throw_err!(ErrorCode::FailedVocVerification);
                }
            }
            return Ok(());
        }

        //Priority 3: FVC
        if self.fvc.is_some() {
            match creators {
                Some(creators) => {
                    let fvc = creators.iter().find(|c| c.verified);
                    match fvc {
                        Some(fvc) => {
                            //fvc doesn't match? fail
                            if self.fvc.unwrap() != fvc.address {
                                throw_err!(ErrorCode::FailedFvcVerification);
                            }
                        }
                        //failed to find an FVC? fail
                        None => {
                            throw_err!(ErrorCode::FailedFvcVerification);
                        }
                    }
                }
                //no creators array? fail
                None => {
                    throw_err!(ErrorCode::FailedFvcVerification);
                }
            }
            return Ok(());
        }

        //should never be getting to here
        throw_err!(ErrorCode::BadWhitelist);
    }
}
