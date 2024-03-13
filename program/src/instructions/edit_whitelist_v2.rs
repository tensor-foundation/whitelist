use crate::{error::ErrorCode, state::WhitelistV2, Condition, WHITELIST_V2_CONDITIONS_LENGTH};
use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct EditWhitelistV2<'info> {
    pub authority: Signer<'info>,

    #[account(
        mut,
        seeds = [
            b"whitelist",
            authority.key().as_ref(),
            &whitelist.uuid
        ],
        bump,
        has_one = authority @ ErrorCode::InvalidAuthority
    )]
    pub whitelist: Account<'info, WhitelistV2>,

    pub system_program: Program<'info, System>,
}

pub fn process_edit_whitelist_v2(
    ctx: Context<EditWhitelistV2>,
    conditions: [Condition; WHITELIST_V2_CONDITIONS_LENGTH],
) -> Result<()> {
    let whitelist = &mut ctx.accounts.whitelist;

    whitelist.conditions = conditions;

    Ok(())
}
