use crate::{error::ErrorCode, state::WhitelistV2, Condition, VEC_LENGTH};
use anchor_lang::prelude::*;

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct EditWhitelistV2Args {
    freeze_authority: Toggle,
    conditions: Option<Vec<Condition>>,
}

// Allows for the update authority to be set to a new pubkey, or cleared.
#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub enum Toggle {
    None,
    Clear,
    Set(Pubkey),
}

impl Toggle {
    pub fn is_some(&self) -> bool {
        matches!(self, Toggle::Clear | Toggle::Set(_))
    }

    pub fn is_none(&self) -> bool {
        matches!(self, Toggle::None)
    }

    pub fn is_clear(&self) -> bool {
        matches!(self, Toggle::Clear)
    }

    pub fn is_set(&self) -> bool {
        matches!(self, Toggle::Set(_))
    }

    pub fn to_option(self) -> Option<Pubkey> {
        match self {
            Toggle::Set(value) => Some(value),
            Toggle::Clear => None,
            Toggle::None => panic!("Tried to convert 'None' value"),
        }
    }
}

#[derive(Accounts)]
#[instruction(args: EditWhitelistV2Args)]
pub struct EditWhitelistV2<'info> {
    #[account(mut)]
    pub update_authority: Signer<'info>,

    // New update authority must be a signer, if present, to prevent mistakes.
    pub new_authority: Option<Signer<'info>>,

    #[account(
        mut,
        seeds = [
            b"whitelist",
            &whitelist.namespace.as_ref(),
            &whitelist.uuid
        ],
        bump,
        // realloc to new length; if no conditions passed in use the existing length--should be no-op
        // args.conditions.as_ref().unwrap_or(&whitelist.conditions).len() just get us either
        // 1) the length of the passed in conditions, if any, or the length of the current conditions
        realloc = WhitelistV2::BASE_SIZE + VEC_LENGTH + args.conditions.as_ref().unwrap_or(&whitelist.conditions).len() * WhitelistV2::CONDITION_SIZE,
        realloc::zero = false,
        realloc::payer = update_authority,
        has_one = update_authority @ ErrorCode::InvalidAuthority
    )]
    pub whitelist: Account<'info, WhitelistV2>,

    pub system_program: Program<'info, System>,
}

//  TODO: Add access control
// #[access_control(WhitelistV2::validate_conditions(&args.conditions.unwrap_or(vec![])))]
pub fn process_edit_whitelist_v2(
    ctx: Context<EditWhitelistV2>,
    args: EditWhitelistV2Args,
) -> Result<()> {
    let whitelist = &mut ctx.accounts.whitelist;

    // Update the freeze authority. If the Toggle is None, then there's nothing to do.
    if let Toggle::Set(authority) = args.freeze_authority {
        // Set
        whitelist.freeze_authority = authority;
    } else if args.freeze_authority.is_clear() {
        // Clear
        whitelist.freeze_authority = Pubkey::default()
    }

    // Change the update authority.
    if let Some(new_update_authority) = &ctx.accounts.new_authority {
        whitelist.update_authority = new_update_authority.key();
    }

    // Set new conditions if they are present. Realloc happens in the account declaration.
    if let Some(conditions) = args.conditions {
        whitelist.conditions = conditions;
    }

    Ok(())
}