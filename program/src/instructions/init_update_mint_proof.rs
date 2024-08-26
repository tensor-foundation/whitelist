use anchor_lang::prelude::*;
use anchor_spl::token_interface::Mint;
use tensor_toolbox::validate_proof;
use tensor_vipers::{throw_err, unwrap_int};

use crate::{
    error::ErrorCode,
    state::{MintProof, Whitelist, MAX_PROOF_LEN, MINT_PROOF_SIZE},
};

#[derive(Accounts)]
pub struct InitUpdateMintProof<'info> {
    #[account(
        seeds = [&whitelist.uuid],
        bump = whitelist.bump
    )]
    pub whitelist: Box<Account<'info, Whitelist>>,

    pub mint: Box<InterfaceAccount<'info, Mint>>,

    // Seed derived from mint + whitelist addresses.
    #[account(
        init_if_needed,
        payer = user,
        seeds = [
            MintProof::PREFIX,
            mint.key().as_ref(),
            whitelist.key().as_ref(),
        ],
        bump,
        space = MINT_PROOF_SIZE
    )]
    pub mint_proof: Box<Account<'info, MintProof>>,

    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

pub fn process_init_update_mint_proof(
    ctx: Context<InitUpdateMintProof>,
    proof: Vec<[u8; 32]>,
) -> Result<()> {
    let mint_proof = &mut ctx.accounts.mint_proof;
    let leaf = anchor_lang::solana_program::keccak::hash(ctx.accounts.mint.key().as_ref());

    // This won't happen currently b/c transaction size is hit before we can run into this.
    // TODO: revisit + test.
    if proof.len() > MAX_PROOF_LEN {
        throw_err!(ErrorCode::ProofTooLong);
    }

    require!(
        validate_proof(&ctx.accounts.whitelist.root_hash, &leaf.0, &proof),
        ErrorCode::FailedMerkleProofVerification,
    );

    // Upsert proof into the MintProof account.
    mint_proof.proof_len = unwrap_int!(u8::try_from(proof.len()).ok());

    // Zero out array.
    for elem in mint_proof.proof.iter_mut() {
        *elem = [0; 32];
    }

    mint_proof.proof[0..proof.len()].copy_from_slice(proof.as_slice());

    Ok(())
}
