mod authority;
mod full_merkle_proof;
mod mint_proof;
mod whitelist;

pub use authority::*;
pub use full_merkle_proof::*;
pub use mint_proof::*;
pub use whitelist::*;

// V2
mod mint_proof_v2;
mod whitelist_v2;

pub use mint_proof_v2::*;
pub use whitelist_v2::*;

use anchor_lang::{prelude::*, AccountDeserialize};
use solana_program::{account_info::AccountInfo, pubkey::Pubkey};
use vipers::throw_err;

use crate::error::ErrorCode;

/// Constant for zero array.
pub const ZERO_ARRAY: [u8; 32] = [0; 32];

/// Borsh prefix size for a vector.
pub const VEC_LENGTH: usize = 4;

#[inline(never)]
pub fn assert_decode_whitelist(whitelist_info: &AccountInfo) -> Result<Whitelist> {
    let mut data: &[u8] = &whitelist_info.try_borrow_data()?;
    let whitelist: Whitelist = AccountDeserialize::try_deserialize(&mut data)?;

    let (key, _) = Pubkey::find_program_address(&[&whitelist.uuid], &crate::ID);
    if key != *whitelist_info.key {
        throw_err!(ErrorCode::BadWhitelist);
    }
    // Check account owner (redundant because of find_program_address above, but why not).
    if *whitelist_info.owner != crate::ID {
        throw_err!(ErrorCode::BadWhitelist);
    }

    Ok(whitelist)
}
