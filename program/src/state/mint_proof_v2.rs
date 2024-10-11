use anchor_lang::prelude::*;

use crate::MAX_PROOF_LEN;

use super::DISCRIMINATOR_SIZE;

/// MintProof V2 state
/// Seeds: ["mint_proof_v2", mint, whitelist]
///
/// The state account for MintProofV2 that stores the proof
/// that a particular mint is part of a Merkle tree. The account
/// is derived from the mint and the whitelist to tie them together uniquely.
///
/// Mint proofs are designed to be created on-the-fly when needed, typically in the same
/// transaction. Creating and closing them is permissionless, but the creation slot is used
/// to determine if the original payer receives the rent back or if the current caller does.
/// There is a 100 slot delay after which the current caller receives the rent back to incentivize
/// cleaning up old accounts.
#[account]
#[derive(Debug, Default, InitSpace, Eq, PartialEq)]
pub struct MintProofV2 {
    /// Length of proof without padding.
    pub proof_len: u8,
    /// Proof that the mint is part of the Merkle tree.
    pub proof: [[u8; 32]; MAX_PROOF_LEN],
    /// Slot the proof was created.
    pub creation_slot: u64,
    /// The account that paid for creation of the proof.
    pub payer: Pubkey,
}

impl MintProofV2 {
    /// Prefix used for seeds derivation.
    pub const PREFIX: &'static [u8] = b"mint_proof_v2";
    pub const SIZE: usize = DISCRIMINATOR_SIZE + Self::INIT_SPACE;
}
