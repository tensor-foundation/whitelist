use anchor_lang::prelude::*;
use anchor_spl::token_interface::Mint;
use tensor_toolbox::validate_proof;
use vipers::{throw_err, unwrap_int};

use crate::{
    error::ErrorCode,
    state::{MintProofV2, MAX_PROOF_LEN},
    Mode, WhitelistV2,
};

#[derive(Accounts)]
pub struct CreateMintProofV2<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

    pub mint: Box<InterfaceAccount<'info, Mint>>,

    // No constraints checks here because creating the mint proof is permissionless.
    // As long as the mint proof validates against the whitelist, it's valid.
    #[account(
        seeds = [
            b"whitelist",
            &whitelist.namespace.key().as_ref(),
            &whitelist.uuid
        ],
        bump = whitelist.bump,
    )]
    pub whitelist: Box<Account<'info, WhitelistV2>>,

    // Seed derived from mint + whitelist addresses.
    #[account(
        init,
        payer = payer,
        seeds = [
            b"mint_proof".as_ref(),
            mint.key().as_ref(),
            whitelist.key().as_ref(),
        ],
        bump,
        space = 8 + MintProofV2::INIT_SPACE,
    )]
    pub mint_proof: Box<Account<'info, MintProofV2>>,

    pub system_program: Program<'info, System>,
}

pub fn process_create_mint_proof_v2(
    ctx: Context<CreateMintProofV2>,
    proof: Vec<[u8; 32]>,
) -> Result<()> {
    let mint_proof = &mut ctx.accounts.mint_proof;
    let whitelist = &ctx.accounts.whitelist;
    let leaf = anchor_lang::solana_program::keccak::hash(ctx.accounts.mint.key().as_ref());

    // This won't happen currently b/c transaction size is hit before we can run into this.
    // TODO: revisit + test.
    if proof.len() > MAX_PROOF_LEN {
        throw_err!(ErrorCode::ProofTooLong);
    }

    if let Some(condition) = whitelist.conditions.first() {
        // Ensure the condition at the whitelist index is a merkle root type
        require!(
            condition.mode == Mode::MerkleProof,
            ErrorCode::NotMerkleRoot
        );

        // Validate the proof.
        require!(
            validate_proof(&condition.value.to_bytes(), &leaf.0, &proof),
            ErrorCode::FailedMerkleProofVerification,
        );
    } else {
        throw_err!(ErrorCode::InvalidWhitelistIndex);
    }

    // Upsert proof into the MintProof account.
    mint_proof.proof_len = unwrap_int!(u8::try_from(proof.len()).ok());
    // let padded_proof = &mut proof.to_vec();
    // padded_proof.resize(MAX_PROOF_LEN, [0; 32]);

    // Zero out array.
    for elem in mint_proof.proof.iter_mut() {
        *elem = [0; 32];
    }

    mint_proof.proof[0..proof.len()].copy_from_slice(proof.as_slice());

    let clock = Clock::get()?;
    mint_proof.creation_slot = clock.slot;
    mint_proof.payer = *ctx.accounts.payer.key;

    Ok(())
}
