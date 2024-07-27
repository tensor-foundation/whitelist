use anchor_lang::prelude::*;

use crate::{state::WhitelistV2, State};

/// Unfreeze the whitelist, allowing updates to it.
#[derive(Accounts)]
pub struct UnfreezeWhitelistV2<'info> {
    pub freeze_authority: Signer<'info>,

    #[account(
        mut,
        has_one = freeze_authority,
    )]
    pub whitelist: Account<'info, WhitelistV2>,
}

/// Unfreezes the whitelist, allowing further updates.
pub fn process_unfreeze_whitelist_v2(ctx: Context<UnfreezeWhitelistV2>) -> Result<()> {
    let whitelist = &mut ctx.accounts.whitelist;
    whitelist.state = State::Unfrozen;

    Ok(())
}
