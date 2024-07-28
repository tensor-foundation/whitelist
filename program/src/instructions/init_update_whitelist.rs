use anchor_lang::prelude::*;
use tensor_vipers::throw_err;

use crate::{
    error::ErrorCode,
    state::{Authority, Whitelist, WHITELIST_SIZE, ZERO_ARRAY},
    CURRENT_WHITELIST_VERSION,
};

#[derive(Accounts)]
#[instruction(uuid: [u8; 32])]
pub struct InitUpdateWhitelist<'info> {
    #[account(
        init_if_needed,
        payer = cosigner,
        seeds = [&uuid],
        bump,
        space = WHITELIST_SIZE
    )]
    pub whitelist: Box<Account<'info, Whitelist>>,

    /// there can only be 1 whitelist authority (due to seeds),
    /// and we're checking that 1)the correct cosigner is present on it, and 2)is a signer
    #[account(
        seeds = [],
        bump = whitelist_authority.bump,
        has_one = cosigner,
    )]
    pub whitelist_authority: Box<Account<'info, Authority>>,

    /// only cosigner has to sign for unfrozen, for frozen owner also has to sign
    #[account(mut)]
    pub cosigner: Signer<'info>,
    pub system_program: Program<'info, System>,
    //remainingAccounts:
    //1. owner (signer, non-mut)
}

/// Store min 1, max 3, check in priority order
pub fn process_init_update_whitelist(
    ctx: Context<InitUpdateWhitelist>,
    uuid: [u8; 32],
    root_hash: Option<[u8; 32]>,
    name: Option<[u8; 32]>,
    voc: Option<Pubkey>,
    fvc: Option<Pubkey>,
) -> Result<()> {
    let whitelist = &mut ctx.accounts.whitelist;
    let auth = &ctx.accounts.whitelist_authority;
    let iter = &mut ctx.remaining_accounts.iter();

    //handle frozen whitelists - only updatable if owner signs off
    if whitelist.frozen {
        //will fail if extra acc not passed
        let owner = next_account_info(iter).map_err(|_| ErrorCode::BadOwner)?;
        //since passed in as optional acc, verify both 1)is signer and 2)is correct auth
        if !owner.is_signer || auth.owner != *owner.key {
            throw_err!(ErrorCode::BadOwner);
        }
    }

    whitelist.version = CURRENT_WHITELIST_VERSION;
    whitelist.bump = ctx.bumps.whitelist;
    // TODO: temp feature since for now we're keeping WL permissioned
    whitelist.verified = true;
    // set uuid (won't change after initialization)
    whitelist.uuid = uuid;
    whitelist.voc = voc;
    whitelist.fvc = fvc;

    //at least one of 3 verification methods must be present
    if (voc.is_none() || voc.unwrap() == Pubkey::default())
        && (fvc.is_none() || fvc.unwrap() == Pubkey::default())
        && (root_hash.is_none() || root_hash.unwrap() == ZERO_ARRAY)
    {
        throw_err!(ErrorCode::MissingVerification);
    }

    // set root hash (can be empty as long as at least one other verification method present)
    if let Some(root_hash) = root_hash {
        whitelist.root_hash = root_hash;
    }

    // set name (can't be empty if we're initializing it for the first time)
    match name {
        Some(name) => {
            whitelist.name = name;
        }
        None => {
            if whitelist.name == ZERO_ARRAY {
                throw_err!(ErrorCode::MissingName);
            }
        }
    }

    Ok(())
}
