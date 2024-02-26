use anchor_lang::prelude::*;

use crate::state::{Authority, Whitelist};

#[derive(Accounts)]
pub struct FreezeWhitelist<'info> {
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
        has_one = cosigner,
    )]
    pub whitelist_authority: Box<Account<'info, Authority>>,

    /// freezing only requires cosigner
    #[account(mut)]
    pub cosigner: Signer<'info>,
    pub system_program: Program<'info, System>,
}

pub fn process_freeze_whitelist(ctx: Context<FreezeWhitelist>) -> Result<()> {
    let whitelist = &mut ctx.accounts.whitelist;
    whitelist.frozen = true;

    Ok(())
}
