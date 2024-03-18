use anchor_lang::prelude::*;

use crate::state::MintProofV2;

#[constant]
pub const SLOT_DELAY: u64 = 100;

#[derive(Accounts)]
pub struct CloseMintProofV2<'info> {
    /// CHECK: This account just receives refunded rent, so there are no checks to be done.
    #[account(mut)]
    pub payer: AccountInfo<'info>,

    // Signing account, will receive rent if 100 slots after mint_proof creation.
    #[account(mut)]
    pub signer: Signer<'info>,

    #[account(mut)]
    pub mint_proof: Box<Account<'info, MintProofV2>>,

    pub system_program: Program<'info, System>,
}

pub fn process_close_mint_proof_v2(ctx: Context<CloseMintProofV2>) -> Result<()> {
    let mint_proof = &ctx.accounts.mint_proof;

    let clock = Clock::get()?;

    // Close the mint proof account.
    if clock.slot < mint_proof.creation_slot + SLOT_DELAY {
        mint_proof.close(ctx.accounts.payer.to_account_info())?;
    } else {
        mint_proof.close(ctx.accounts.signer.to_account_info())?;
    };

    Ok(())
}
