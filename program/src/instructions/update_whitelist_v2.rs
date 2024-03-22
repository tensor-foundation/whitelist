use crate::{error::ErrorCode, state::WhitelistV2, Condition, VEC_LENGTH};
use anchor_lang::prelude::*;

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct UpdateWhitelistV2Args {
    freeze_authority: Operation,
    conditions: Option<Vec<Condition>>,
}

// Allows for the update authority to be set to a new pubkey, or cleared.
#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub enum Operation {
    Noop,
    Clear,
    Set(Pubkey),
}

impl Operation {
    pub fn is_noop(&self) -> bool {
        matches!(self, Operation::Noop)
    }

    pub fn is_clear(&self) -> bool {
        matches!(self, Operation::Clear)
    }

    pub fn is_set(&self) -> bool {
        matches!(self, Operation::Set(_))
    }

    pub fn to_option(self) -> Option<Pubkey> {
        match self {
            Operation::Set(value) => Some(value),
            Operation::Clear => None,
            Operation::Noop => panic!("Tried to convert 'Noop' value"),
        }
    }
}

#[derive(Accounts)]
#[instruction(args: UpdateWhitelistV2Args)]
pub struct UpdateWhitelistV2<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

    #[account(mut)]
    pub update_authority: Signer<'info>,

    // New update authority must be a signer, if present, to prevent mistakes.
    pub new_update_authority: Option<Signer<'info>>,

    #[account(
        mut,
        // Realloc to new length; if no conditions are passed in, use the existing length--which should be no-op.
        // args.conditions.as_ref().unwrap_or(&whitelist.conditions).len() just get us either
        // 1) the length of the passed in conditions, or the length of the current conditions
        realloc = WhitelistV2::BASE_SIZE + VEC_LENGTH + args.conditions.as_ref().unwrap_or(&whitelist.conditions).len() * WhitelistV2::CONDITION_SIZE,
        realloc::zero = false,
        realloc::payer = payer,
        has_one = update_authority @ ErrorCode::InvalidAuthority
    )]
    pub whitelist: Account<'info, WhitelistV2>,

    pub system_program: Program<'info, System>,
}

pub fn process_update_whitelist_v2(
    ctx: Context<UpdateWhitelistV2>,
    args: UpdateWhitelistV2Args,
) -> Result<()> {
    let whitelist = &mut ctx.accounts.whitelist;

    // None means no update to conditions so nothing to validate.
    if let Some(mut conditions) = args.conditions {
        WhitelistV2::validate_conditions(&mut conditions)?;
        whitelist.conditions = conditions;
    }

    // Check if the whitelist is frozen; cannot update if it is.
    if whitelist.is_frozen() {
        return Err(ErrorCode::WhitelistIsFrozen.into());
    }

    // Update the freeze authority. If the Toggle is None, then there's nothing to do.
    // Update authority can change the freeze authority if the whitelist is unfrozen,
    // but cannot unfreeze the whitelist itself.
    if let Operation::Set(authority) = args.freeze_authority {
        // Set
        whitelist.freeze_authority = authority;
    } else if args.freeze_authority.is_clear() {
        // Clear
        whitelist.freeze_authority = Pubkey::default()
    }

    // Change the update authority.
    if let Some(new_update_authority) = &ctx.accounts.new_update_authority {
        whitelist.update_authority = new_update_authority.key();
    }

    Ok(())
}
