use crate::{error::ErrorCode, state::WhitelistV2};
use anchor_lang::prelude::*;

/// Create a Whitelist V2 account.
///
/// Whitelist PDAs are derived from both a namespace and a UUID.
/// The namespace is a keypair that must sign when creating the whitelist and is
/// used to differentiate whitelists without tying it to the update authority, which
/// can be changed. Namespaces can be one-off that are generated for each whitelist and
/// thrown away, or they can be re-used to group whitelists together for e.g. gPA filtering.
#[derive(Accounts)]
pub struct CloseWhitelistV2<'info> {
    /// The rent payer.
    /// CHECK: The update authority deciedes who receives the refunded rent.
    #[account(mut)]
    pub rent_destination: UncheckedAccount<'info>,

    /// The authority that will be allowed to update the whitelist.
    #[account(mut)]
    pub update_authority: Signer<'info>,

    /// The whitelist PDA.
    #[account(
        mut,
        close = rent_destination,
        has_one = update_authority @ ErrorCode::InvalidAuthority
    )]
    pub whitelist: Account<'info, WhitelistV2>,

    pub system_program: Program<'info, System>,
}

/// Close a Whitelist V2 account.
pub fn process_close_whitelist_v2(ctx: Context<CloseWhitelistV2>) -> Result<()> {
    let whitelist = &mut ctx.accounts.whitelist;

    // Check if the whitelist is frozen; cannot close if it is.
    if whitelist.is_frozen() {
        return Err(ErrorCode::WhitelistIsFrozen.into());
    }

    Ok(())
}
