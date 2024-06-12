use anchor_lang::prelude::*;

// 28-length padded merkle proof -> 2^28 mints supported.
// 28 is max length b/c of tx size limits.
#[constant]
pub const MAX_PROOF_LEN: usize = 28;

// (!) INCLUSIVE of discriminator (8 bytes)
// (!) Sync with MAX_PROOF_LEN (can't ref teh constant or wont show up in IDL)
#[constant]
#[allow(clippy::identity_op)]
pub const MINT_PROOF_SIZE: usize = 8 + (32 * 28) + 1;

#[account]
#[derive(Debug, Default, Eq, PartialEq)]
pub struct MintProof {
    // Length of proof (w/o padding).
    pub proof_len: u8,
    pub proof: [[u8; 32]; MAX_PROOF_LEN],
}

impl MintProof {
    pub const PREFIX: &'static [u8] = b"mint_proof";
}
