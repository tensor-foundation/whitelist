use crate::{
    state::WhitelistV2, Condition, CURRENT_WHITELIST_VERSION, WHITELIST_V2_CONDITIONS_LENGTH,
};
use anchor_lang::prelude::*;

#[derive(Accounts)]
#[instruction(conditions: [Condition; WHITELIST_V2_CONDITIONS_LENGTH], uuid: [u8; 32])]
pub struct CreateWhitelistV2<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(
        init,
        payer = authority,
        space = WhitelistV2::SIZE,
        seeds = [
            b"whitelist",
            authority.key().as_ref(),
            &uuid
        ],
        bump
    )]
    pub whitelist: Account<'info, WhitelistV2>,

    pub system_program: Program<'info, System>,
}

pub fn process_create_whitelist_v2(
    ctx: Context<CreateWhitelistV2>,
    conditions: [Condition; WHITELIST_V2_CONDITIONS_LENGTH],
    uuid: [u8; 32],
) -> Result<()> {
    let whitelist = &mut ctx.accounts.whitelist;

    whitelist.version = CURRENT_WHITELIST_VERSION;
    whitelist.bump = ctx.bumps.whitelist;
    whitelist.uuid = uuid;
    whitelist.authority = ctx.accounts.authority.key();
    whitelist.conditions = conditions;

    Ok(())
}
