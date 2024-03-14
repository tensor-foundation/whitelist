use anchor_lang::prelude::*;

use crate::MAX_PROOF_LEN;

// (!) INCLUSIVE of discriminator (8 bytes)
// (!) Sync with MAX_PROOF_LEN (can't ref the constant or wont show up in IDL)
#[constant]
pub const MINT_PROOF_V2_SIZE: usize =
      8                     // discriminator
    + 1                     // proof_len
    + (32 * 28)             // proof
    + 8                     // creation_slot
    + 32                    // authority
;

/// Seeds: ["mint_proof", mint, whitelist]
#[account]
#[derive(InitSpace)]
pub struct MintProofV2 {
    // Length of proof (w/o padding).
    pub proof_len: u8,
    pub proof: [[u8; 32]; MAX_PROOF_LEN],
    pub creation_slot: u64,
    pub payer: Pubkey,
}
