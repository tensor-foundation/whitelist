use anchor_lang::prelude::*;

use crate::state::{Authority, Whitelist};

#[derive(Accounts)]
pub struct UnfreezeWhitelist<'info> {
    #[account(
        mut,
        seeds = [&whitelist.uuid],
        bump = whitelist.bump
    )]
    pub whitelist: Box<Account<'info, Whitelist>>,

    /// there can only be 1 whitelist authority (due to seeds),
    /// and we're checking that 1)the correct cosigner is present on it, and 2)is a signer
    #[account(
        seeds = [],
        bump = whitelist_authority.bump,
        has_one = owner
    )]
    pub whitelist_authority: Box<Account<'info, Authority>>,

    /// unfreezing requires owner
    #[account(mut)]
    pub owner: Signer<'info>,
    pub system_program: Program<'info, System>,
}

//separate ix coz requires different signer
pub fn process_unfreeze_whitelist(ctx: Context<UnfreezeWhitelist>) -> Result<()> {
    let whitelist = &mut ctx.accounts.whitelist;
    whitelist.frozen = false;

    Ok(())
}
