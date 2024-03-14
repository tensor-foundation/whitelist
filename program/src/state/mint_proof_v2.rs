use anchor_lang::prelude::*;

use crate::MAX_PROOF_LEN;

// (!) INCLUSIVE of discriminator (8 bytes)
// (!) Sync with MAX_PROOF_LEN (can't ref teh constant or wont show up in IDL)
#[constant]
#[allow(clippy::identity_op)]
pub const MINT_PROOF_V2_SIZE: usize = 8 + (32 * 28) + 8 + 32;

/// Seeds: ["mint_proof", mint, whitelist]
#[account]
pub struct MintProofV2 {
    // Length of proof (w/o padding).
    pub proof_len: u8,
    pub proof: [[u8; 32]; MAX_PROOF_LEN],
    pub created_at: i64,
    pub authority: Pubkey,
}
