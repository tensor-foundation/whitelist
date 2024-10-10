use crate::{error::ErrorCode, state::WhitelistV2};
use anchor_lang::prelude::*;

/// Close a Whitelist V2 account.
///
/// The update authority must sign to close but can specify any public key as the rent destination.
/// Frozen whitelists cannot be closed.
#[derive(Accounts)]
pub struct CloseWhitelistV2<'info> {
    /// The rent payer.
    /// CHECK: The update authority decides who receives the refunded rent.
    #[account(mut)]
    pub rent_destination: UncheckedAccount<'info>,

    /// The authority that will be allowed to update the whitelist.
    pub update_authority: Signer<'info>,

    /// The whitelist PDA.
    #[account(
        mut,
        close = rent_destination,
        has_one = update_authority @ ErrorCode::InvalidAuthority,
        constraint = !whitelist.is_frozen() @ ErrorCode::WhitelistIsFrozen
    )]
    pub whitelist: Account<'info, WhitelistV2>,

    pub system_program: Program<'info, System>,
}

/// Close a Whitelist V2 account.
pub fn process_close_whitelist_v2(_ctx: Context<CloseWhitelistV2>) -> Result<()> {
    Ok(())
}
