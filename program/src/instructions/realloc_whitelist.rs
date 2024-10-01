use anchor_lang::prelude::*;
use tensor_vipers::{throw_err, Validate};

use crate::{
    error::ErrorCode,
    state::{Authority, Whitelist, WHITELIST_SIZE},
    CURRENT_WHITELIST_VERSION,
};

#[derive(Accounts)]
pub struct ReallocWhitelist<'info> {
    #[account(mut,
        seeds = [&whitelist.uuid],
        bump = whitelist.bump,
        realloc = WHITELIST_SIZE,
        realloc::payer = cosigner,
        realloc::zero = true
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

    #[account(mut)]
    pub cosigner: Signer<'info>,
    pub system_program: Program<'info, System>,
}

impl<'info> Validate<'info> for ReallocWhitelist<'info> {
    fn validate(&self) -> Result<()> {
        //can only migrate those with old version, intentionally keeping hardcorded to avoid errors
        if self.whitelist.version != 1 {
            throw_err!(ErrorCode::BadWhitelist);
        }
        Ok(())
    }
}

//incr space on whitelist
#[access_control(ctx.accounts.validate())]
pub fn process_realloc_whitelist(ctx: Context<ReallocWhitelist>) -> Result<()> {
    let whitelist = &mut ctx.accounts.whitelist;
    whitelist.version = CURRENT_WHITELIST_VERSION;

    Ok(())
}
