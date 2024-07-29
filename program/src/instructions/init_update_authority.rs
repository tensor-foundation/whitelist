use anchor_lang::prelude::*;
use tensor_vipers::throw_err;

use crate::{
    error::ErrorCode,
    state::{Authority, AUTHORITY_SIZE},
};

#[derive(Accounts)]
pub struct InitUpdateAuthority<'info> {
    #[account(init_if_needed, payer = cosigner, seeds = [], bump, space = AUTHORITY_SIZE)]
    pub whitelist_authority: Box<Account<'info, Authority>>,

    /// both have to sign on any updates
    #[account(mut)]
    pub cosigner: Signer<'info>,
    pub owner: Signer<'info>,

    pub system_program: Program<'info, System>,
}

// TODO: naive - move to current/pending authority later
pub fn process_init_update_authority(
    ctx: Context<InitUpdateAuthority>,
    new_cosigner: Option<Pubkey>,
    new_owner: Option<Pubkey>,
) -> Result<()> {
    let authority = &mut ctx.accounts.whitelist_authority;

    //if cosigner already present, make sure it's signing off on the update
    //1. isSigner checked by anchor
    //2. check it's the correct one
    if authority.cosigner != Pubkey::default() && authority.cosigner != ctx.accounts.cosigner.key()
    {
        throw_err!(ErrorCode::BadCosigner);
    }
    //if owner already present, make sure it's signing off on the update
    //1. isSigner checked by anchor
    //2. check it's the correct one
    if authority.owner != Pubkey::default() && authority.owner != ctx.accounts.owner.key() {
        throw_err!(ErrorCode::BadOwner);
    }

    authority.bump = ctx.bumps.whitelist_authority;

    if let Some(new_cosigner) = new_cosigner {
        authority.cosigner = new_cosigner;
    }
    if let Some(new_owner) = new_owner {
        authority.owner = new_owner;
    }

    Ok(())
}
