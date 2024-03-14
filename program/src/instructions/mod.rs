mod freeze_whitelist;
mod init_update_authority;
mod init_update_mint_proof;
mod init_update_whitelist;
mod realloc_authority;
mod realloc_whitelist;
mod unfreeze_whitelist;

pub use freeze_whitelist::*;
pub use init_update_authority::*;
pub use init_update_mint_proof::*;
pub use init_update_whitelist::*;
pub use realloc_authority::*;
pub use realloc_whitelist::*;
pub use unfreeze_whitelist::*;

// V2
mod create_mint_proof_v2;
mod create_whitelist_v2;
mod edit_whitelist_v2;

pub use create_mint_proof_v2::*;
pub use create_whitelist_v2::*;
pub use edit_whitelist_v2::*;

/*
#[inline(never)]
pub fn assert_decode_whitelist(whitelist_info: &AccountInfo) -> Result<Whitelist> {
    let mut data: &[u8] = &whitelist_info.try_borrow_data()?;
    let whitelist: Whitelist = AccountDeserialize::try_deserialize(&mut data)?;

    let (key, _) = Pubkey::find_program_address(&[&whitelist.uuid], &crate::ID);
    if key != *whitelist_info.key {
        throw_err!(BadWhitelist);
    }
    // Check account owner (redundant because of find_program_address above, but why not).
    if *whitelist_info.owner != crate::ID {
        throw_err!(BadWhitelist);
    }

    Ok(whitelist)
}
*/
