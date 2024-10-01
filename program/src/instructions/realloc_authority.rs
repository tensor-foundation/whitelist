use anchor_lang::prelude::*;

use crate::state::{Authority, AUTHORITY_SIZE};

#[derive(Accounts)]
pub struct ReallocAuthority<'info> {
    /// there can only be 1 whitelist authority (due to seeds),
    /// and we're checking that 1)the correct cosigner is present on it, and 2)is a signer
    #[account(mut,
        seeds = [],
        bump = whitelist_authority.bump,
        has_one = cosigner,
        realloc = AUTHORITY_SIZE,
        realloc::payer = cosigner,
        realloc::zero = true
    )]
    pub whitelist_authority: Box<Account<'info, Authority>>,

    #[account(mut)]
    pub cosigner: Signer<'info>,
    pub system_program: Program<'info, System>,
}

//incr space on authority
pub fn process_realloc_authority(_ctx: Context<ReallocAuthority>) -> Result<()> {
    Ok(())
}
