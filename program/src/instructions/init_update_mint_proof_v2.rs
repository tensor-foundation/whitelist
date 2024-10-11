use anchor_lang::prelude::*;
use tensor_toolbox::validate_proof;
use tensor_vipers::{throw_err, unwrap_int};

use crate::{
    error::ErrorCode,
    state::{MintProofV2, MAX_PROOF_LEN},
    Mode, WhitelistV2,
};

/// Permissionlessly initialize or update a mint proof.
///
/// Mint Proofs are designed to be created on-the-fly, typically
/// in the same transaction they are used. They can be permissionlessly
/// created and closed.
#[derive(Accounts)]
pub struct InitUpdateMintProofV2<'info> {
    /// Rent payer for the mint proof account if it is initialized.
    #[account(mut)]
    pub payer: Signer<'info>,

    /// The mint or asset account for which the proof is being created.
    /// CHECK: validation happens in the handler.
    pub mint: UncheckedAccount<'info>,

    /// The whitelist account that the mint proof must validate against.
    // No constraints checks here because creating the mint proof is permissionless.
    // As long as the mint proof validates against the whitelist, it's valid.
    #[account(
        seeds = [
            WhitelistV2::PREFIX,
            &whitelist.namespace.key().as_ref(),
            &whitelist.uuid
        ],
        bump = whitelist.bump,
    )]
    pub whitelist: Box<Account<'info, WhitelistV2>>,

    /// The mint proof account to initialize or update.
    #[account(
        init_if_needed,
        payer = payer,
        seeds = [
            MintProofV2::PREFIX,
            mint.key().as_ref(),
            whitelist.key().as_ref(),
        ],
        bump,
        space = MintProofV2::SIZE,
    )]
    pub mint_proof: Box<Account<'info, MintProofV2>>,

    /// The Solana system program account.
    pub system_program: Program<'info, System>,
}

/// Initializes or updates a mint proof.
pub fn process_init_update_mint_proof_v2(
    ctx: Context<InitUpdateMintProofV2>,
    proof: Vec<[u8; 32]>,
) -> Result<()> {
    let mint_proof = &mut ctx.accounts.mint_proof;
    let whitelist = &ctx.accounts.whitelist;
    let leaf = anchor_lang::solana_program::keccak::hash(ctx.accounts.mint.key().as_ref());

    // This won't happen currently b/c transaction size is hit before we can run into this.
    if proof.len() > MAX_PROOF_LEN {
        throw_err!(ErrorCode::ProofTooLong);
    }

    if let Some(condition) = whitelist.conditions.first() {
        // Ensure the condition at the whitelist index is a merkle root type
        require!(condition.mode == Mode::MerkleTree, ErrorCode::NotMerkleRoot);

        // Validate the proof.
        require!(
            validate_proof(&condition.value.to_bytes(), &leaf.0, &proof.clone()),
            ErrorCode::FailedMerkleProofVerification,
        );
    } else {
        throw_err!(ErrorCode::EmptyConditions);
    }

    // Upsert proof into the MintProof account.
    mint_proof.proof_len = unwrap_int!(u8::try_from(proof.len()).ok());

    // Zero out array.
    for elem in mint_proof.proof.iter_mut() {
        *elem = [0; 32];
    }

    mint_proof.proof[0..proof.len()].copy_from_slice(proof.as_slice());

    let clock = Clock::get()?;
    mint_proof.creation_slot = clock.slot;

    // We don't allow updating the payer, as we want the original payer to receive the rent
    // back when the account is closed within 100 slots of creation date.
    // Only set the payer if it's not already set.
    if mint_proof.payer == Pubkey::default() {
        mint_proof.payer = *ctx.accounts.payer.key;
    }

    Ok(())
}
