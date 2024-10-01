use anchor_lang::prelude::*;

use crate::{error::ErrorCode, state::MintProofV2};

#[constant]
pub const SLOT_DELAY: u64 = 100;

/// Permissionlessly close a mint proof account.
///
/// If the mint proof account is closed before `SLOT_DELAY` slots have passed
/// since its creation, the rent will be paid back to the `payer` account, otherwise
/// it will go to the `signer` account to incentivize clean up of old accounts.
#[derive(Accounts)]
pub struct CloseMintProofV2<'info> {
    /// CHECK: This account must be the same as the stored payer on mint_proof_v2.
    /// Receives rent if < 100 slots after mint_proof creation.
    #[account(mut,
    constraint = payer.key() == mint_proof.payer
    )]
    pub payer: UncheckedAccount<'info>,

    /// Signing account, will receive rent if > 100 slots after mint_proof creation.
    #[account(mut)]
    pub signer: Signer<'info>,

    /// The mint proof account to close.
    #[account(mut)]
    pub mint_proof: Box<Account<'info, MintProofV2>>,

    /// The Solana system program account.
    pub system_program: Program<'info, System>,
}

/// Closes a mint proof account.
pub fn process_close_mint_proof_v2(ctx: Context<CloseMintProofV2>) -> Result<()> {
    let mint_proof = &ctx.accounts.mint_proof;

    let clock = Clock::get()?;

    // Close the mint proof account.
    if clock.slot < mint_proof.creation_slot + SLOT_DELAY {
        // Only the original payer can close the mint proof account before the delay, to prevent DOS attacks.
        require!(
            ctx.accounts.signer.key == ctx.accounts.payer.key,
            ErrorCode::InvalidAuthority
        );
        mint_proof.close(ctx.accounts.payer.to_account_info())?;
    } else {
        mint_proof.close(ctx.accounts.signer.to_account_info())?;
    };

    Ok(())
}
