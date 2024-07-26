use anchor_lang::prelude::*;

use crate::{state::WhitelistV2, State};

/// Set the whitelist state to frozen, to prevent updates to it.
#[derive(Accounts)]
pub struct FreezeWhitelistV2<'info> {
    pub freeze_authority: Signer<'info>,

    #[account(
        mut,
        has_one = freeze_authority,
    )]
    pub whitelist: Account<'info, WhitelistV2>,
}

/// Freezes the whitelist, preventing further updates.
pub fn process_freeze_whitelist_v2(ctx: Context<FreezeWhitelistV2>) -> Result<()> {
    let whitelist = &mut ctx.accounts.whitelist;
    whitelist.state = State::Frozen;

    Ok(())
}
