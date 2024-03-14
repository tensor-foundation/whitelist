use crate::{state::WhitelistV2, Condition, State, CURRENT_WHITELIST_VERSION, VEC_LENGTH};
use anchor_lang::prelude::*;

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct CreateWhitelistV2Args {
    uuid: [u8; 32],
    freeze_authority: Option<Pubkey>,
    conditions: Vec<Condition>,
}

#[derive(Accounts)]
#[instruction(args: CreateWhitelistV2Args)]
pub struct CreateWhitelistV2<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

    #[account(mut)]
    pub update_authority: Signer<'info>,

    // Namespace solana keypair, can be thrown away or used to track the namespace client-side.
    pub namespace: Signer<'info>,

    #[account(
        init,
        payer = payer,
        // Allocate the account to the actual size we need given the number of conditions.
        // Borsh represents vectors with a 4 byte size prefix, which is what VEC_LENGTH accounts for.
        space = WhitelistV2::BASE_SIZE + VEC_LENGTH + args.conditions.len() * WhitelistV2::CONDITION_SIZE,
        seeds = [
            b"whitelist",
            namespace.key().as_ref(),
            &args.uuid
        ],
        bump
    )]
    pub whitelist: Account<'info, WhitelistV2>,

    pub system_program: Program<'info, System>,
}

pub fn process_create_whitelist_v2(
    ctx: Context<CreateWhitelistV2>,
    mut args: CreateWhitelistV2Args,
) -> Result<()> {
    WhitelistV2::validate_conditions(&mut args.conditions)?;

    let whitelist = &mut ctx.accounts.whitelist;

    whitelist.version = CURRENT_WHITELIST_VERSION;
    whitelist.bump = ctx.bumps.whitelist;
    whitelist.uuid = args.uuid;
    whitelist.state = State::Unfrozen;
    whitelist.update_authority = ctx.accounts.update_authority.key();
    whitelist.namespace = ctx.accounts.namespace.key();

    if let Some(freeze_authority) = args.freeze_authority {
        whitelist.freeze_authority = freeze_authority;
    } else {
        whitelist.freeze_authority = Pubkey::default();
    }

    whitelist.conditions = args.conditions;

    Ok(())
}
