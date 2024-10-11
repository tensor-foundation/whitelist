use crate::{state::WhitelistV2, Condition, State, CURRENT_WHITELIST_V2_VERSION};
use anchor_lang::prelude::*;

/// Arguments for creating a Whitelist V2 account.
/// Optional freeze authority defaults to the system program pubkey if not provided.
#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct CreateWhitelistV2Args {
    uuid: [u8; 32],
    freeze_authority: Option<Pubkey>,
    conditions: Vec<Condition>,
}

/// Create a Whitelist V2 account.
///
/// Whitelist PDAs are derived from both a namespace and a UUID.
/// The namespace is a keypair that must sign when creating the whitelist and is
/// used to differentiate whitelists without tying it to the update authority, which
/// can be changed. Namespaces can be one-off that are generated for each whitelist and
/// thrown away, or they can be re-used to group whitelists together for e.g. gPA filtering.
#[derive(Accounts)]
#[instruction(args: CreateWhitelistV2Args)]
pub struct CreateWhitelistV2<'info> {
    /// The rent payer.
    #[account(mut)]
    pub payer: Signer<'info>,

    /// The authority that will be allowed to update the whitelist.
    pub update_authority: Signer<'info>,

    /// Namespace keypair used to derive the whitelist PDA.
    pub namespace: Signer<'info>,

    /// The whitelist PDA.
    #[account(
        init,
        payer = payer,
        // Allocate the account to the actual size we need given the number of conditions.
        // Vec length is included in the base size.
        space = WhitelistV2::BASE_SIZE + args.conditions.len() * WhitelistV2::CONDITION_SIZE,
        seeds = [
            WhitelistV2::PREFIX,
            namespace.key().as_ref(),
            &args.uuid
        ],
        bump
    )]
    pub whitelist: Account<'info, WhitelistV2>,

    /// The Solana system program.
    pub system_program: Program<'info, System>,
}

/// Create a Whitelist V2 account.
pub fn process_create_whitelist_v2(
    ctx: Context<CreateWhitelistV2>,
    mut args: CreateWhitelistV2Args,
) -> Result<()> {
    WhitelistV2::validate_conditions(&mut args.conditions)?;

    let whitelist = &mut ctx.accounts.whitelist;

    whitelist.version = CURRENT_WHITELIST_V2_VERSION;
    whitelist.bump = ctx.bumps.whitelist;
    whitelist.uuid = args.uuid;
    whitelist.state = State::Unfrozen;

    whitelist.update_authority = ctx.accounts.update_authority.key();
    whitelist.namespace = ctx.accounts.namespace.key();
    whitelist.freeze_authority = args.freeze_authority.unwrap_or_default();

    whitelist.conditions = args.conditions;

    Ok(())
}
