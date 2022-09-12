use anchor_lang::prelude::*;
use vipers::throw_err;

declare_id!("TL1ST2iRBzuGTqLn1KXnGdSnEow62BzPnGiqyRXhWtW");

pub const CURRENT_WHITELIST_VERSION: u8 = 1;

#[program]
pub mod tensor_whitelist {
    use super::*;

    pub fn init_update_authority(
        ctx: Context<InitUpdateAuthority>,
        new_owner: Pubkey,
    ) -> Result<()> {
        let authority = &mut ctx.accounts.whitelist_authority;

        //if authority already present, make sure it's signing off on the update
        if authority.owner != Pubkey::default() && authority.owner != ctx.accounts.owner.key() {
            throw_err!(BadOwner);
        }

        authority.bump = *ctx.bumps.get("whitelist_authority").unwrap();
        authority.owner = new_owner;

        Ok(())
    }

    pub fn init_update_whitelist(
        ctx: Context<InitUpdateWhitelist>,
        uuid: [u8; 32],
        root_hash: Option<[u8; 32]>,
        name: Option<[u8; 32]>,
    ) -> Result<()> {
        let whitelist = &mut ctx.accounts.whitelist;

        whitelist.version = CURRENT_WHITELIST_VERSION;
        whitelist.bump = *ctx.bumps.get("whitelist").unwrap();
        // TODO: temp feature since for now we're keeping WL permissioned
        whitelist.verified = true;
        // set uuid (won't change after initialization)
        whitelist.uuid = uuid;

        // set root hash (can't be empty)
        match root_hash {
            Some(root_hash) => {
                whitelist.root_hash = root_hash;
            }
            None => {
                msg!("root hash is {:?}", whitelist.root_hash);
                if whitelist.root_hash == [0; 32] {
                    throw_err!(MissingRootHash);
                }
            }
        }

        // set name (can't be empty)
        match name {
            Some(name) => {
                whitelist.name = name;
            }
            None => {
                if whitelist.name == [0; 32] {
                    throw_err!(MissingName);
                }
            }
        }

        Ok(())
    }
}

#[derive(Accounts)]
pub struct InitUpdateAuthority<'info> {
    #[account(init_if_needed, payer = owner, seeds = [], bump, space = 8 + Authority::SIZE)]
    pub whitelist_authority: Box<Account<'info, Authority>>,

    #[account(mut)]
    pub owner: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(uuid: [u8; 32])]
pub struct InitUpdateWhitelist<'info> {
    #[account(init_if_needed, payer = owner, seeds = [&uuid], bump, space = 8 + Whitelist::SIZE)]
    pub whitelist: Box<Account<'info, Whitelist>>,

    /// there can only be 1 whitelist authority (due to seeds),
    /// and we're checking that 1)the correct owner is present on it, and 2)is a signer
    #[account(seeds = [], bump = whitelist_authority.bump, has_one=owner)]
    pub whitelist_authority: Box<Account<'info, Authority>>,

    #[account(mut)]
    pub owner: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[account]
pub struct Authority {
    pub bump: u8,
    // TODO: naive - move to current/pending authority later
    pub owner: Pubkey,
}

impl Authority {
    pub const SIZE: usize = 1 + 32;
}

#[account]
pub struct Whitelist {
    pub version: u8,
    pub bump: u8,
    pub verified: bool,
    pub root_hash: [u8; 32],
    pub uuid: [u8; 32],
    pub name: [u8; 32],
}

impl Whitelist {
    pub const SIZE: usize = 1 + 1 + 1 + (32 * 3);
}

#[error_code]
pub enum ErrorCode {
    #[msg("passed in owner doesnt have the rights to do this")]
    BadOwner,
    #[msg("missing root hash")]
    MissingRootHash,
    #[msg("missing name")]
    MissingName,
}
