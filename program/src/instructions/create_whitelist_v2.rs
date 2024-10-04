use crate::{state::WhitelistV2, Condition, State, CURRENT_WHITELIST_V2_VERSION, VEC_LENGTH};
use anchor_lang::prelude::*;

/// Arguments for creating a Whitelist V2 account.
/// Optional freeze authority defaulst to the system program pubkey if not provided.
#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct CreateWhitelistV2Args {
    uuid: [u8; 32],
    // TODO: personally found it weird that updated_authority is a signer but freeze_authority is not
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
    #[account(mut)]
    pub update_authority: Signer<'info>,

    /// Namespace keypair used to derive the whitelist PDA.
    /// Hm I guess we need this because we want to be able to quickly fing whitelists belonging to one user, and has to sign off since otherwise how do you know someone else didnt add it
    pub namespace: Signer<'info>,

    /// The whitelist PDA.
    #[account(
        init,
        payer = payer,
        // Allocate the account to the actual size we need given the number of conditions.
        // Borsh represents vectors with a 4 byte size prefix, which is what VEC_LENGTH accounts for.
        space = WhitelistV2::BASE_SIZE + VEC_LENGTH + args.conditions.len() * WhitelistV2::CONDITION_SIZE,
        seeds = [
            WhitelistV2::PREFIX,
            namespace.key().as_ref(),
            &args.uuid
        ],
        bump
    )]
    pub whitelist: Account<'info, WhitelistV2>,

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
