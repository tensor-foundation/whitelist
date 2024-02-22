use solana_program::{account_info::AccountInfo, pubkey::Pubkey};

use crate::{accounts::Whitelist, errors::TensorWhitelistError};

#[inline(never)]
pub fn assert_decode_whitelist(
    whitelist_info: &AccountInfo,
) -> Result<Whitelist, TensorWhitelistError> {
    let whitelist =
        Whitelist::try_from(whitelist_info).map_err(|_| TensorWhitelistError::BadWhitelist)?;

    let (key, _) = Pubkey::find_program_address(&[&whitelist.uuid], &crate::ID);
    if key != *whitelist_info.key {
        return Err(TensorWhitelistError::BadWhitelist);
    }
    // Check account owner (redundant because of find_program_address above, but why not).
    if *whitelist_info.owner != crate::ID {
        return Err(TensorWhitelistError::BadWhitelist);
    }

    Ok(whitelist)
}
