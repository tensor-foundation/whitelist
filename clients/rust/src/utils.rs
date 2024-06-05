use solana_program::{account_info::AccountInfo, pubkey::Pubkey};

use crate::{
    accounts::{Whitelist, WhitelistV2},
    errors::TensorWhitelistError,
    types::{Condition, Mode, State},
};

/// Whitelist Anchor account discriminator.
const WHITELIST_DISCRIMINATOR: [u8; 8] = [204, 176, 52, 79, 146, 121, 54, 247];

/// WhitelistV2 Anchor account discriminator.
const WHITELIST_V2_DISCRIMINATOR: [u8; 8] = [136, 184, 45, 191, 85, 203, 191, 119];

// Constant for zero array.
pub const ZERO_ARRAY: [u8; 32] = [0; 32];

impl Default for Whitelist {
    fn default() -> Self {
        Self {
            discriminator: WHITELIST_DISCRIMINATOR,
            version: 0,
            bump: 0,
            verified: false,
            root_hash: ZERO_ARRAY,
            uuid: [0; 32],
            name: [0; 32],
            frozen: false,
            voc: None,
            fvc: None,
            reserved: [0; 64],
        }
    }
}

impl Default for WhitelistV2 {
    fn default() -> Self {
        Self {
            discriminator: WHITELIST_V2_DISCRIMINATOR,
            version: 0,
            bump: 0,
            uuid: [0; 32],
            state: State::Unfrozen,
            update_authority: Pubkey::default(),
            namespace: Pubkey::new_unique(),
            freeze_authority: Pubkey::default(),
            conditions: vec![Condition {
                mode: Mode::FVC,
                value: Pubkey::default(),
            }],
        }
    }
}

#[inline(never)]
pub fn assert_decode_whitelist(
    whitelist_info: &AccountInfo,
) -> Result<Whitelist, TensorWhitelistError> {
    let whitelist = Whitelist::try_from(whitelist_info).unwrap();

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

pub enum WhitelistType {
    V1(Whitelist),
    V2(WhitelistV2),
}

/// Temporary function to decode both whitelist versions, will be removed after WhitelistV1s are migrated to V2.
#[inline(never)]
pub fn assert_decode_generic_whitelist(
    whitelist_info: &AccountInfo,
) -> Result<WhitelistType, TensorWhitelistError> {
    let data: &[u8] = &whitelist_info
        .try_borrow_data()
        .map_err(|_| TensorWhitelistError::BadWhitelist)?;

    let discriminator: [u8; 8] = data[0..8].try_into().unwrap();

    // Check account owner.
    if *whitelist_info.owner != crate::ID {
        return Err(TensorWhitelistError::BadOwner);
    }

    match discriminator {
        WHITELIST_DISCRIMINATOR => {
            let whitelist = Whitelist::try_from(whitelist_info)
                .map_err(|_| TensorWhitelistError::BadWhitelist)?;

            let (key, _) = Pubkey::find_program_address(&[&whitelist.uuid], &crate::ID);
            if key != *whitelist_info.key {
                return Err(TensorWhitelistError::BadWhitelist);
            }

            Ok(WhitelistType::V1(whitelist))
        }
        WHITELIST_V2_DISCRIMINATOR => {
            let whitelist = WhitelistV2::try_from(whitelist_info)
                .map_err(|_| TensorWhitelistError::BadWhitelist)?;

            let (key, _) = Pubkey::find_program_address(
                &[b"whitelist", whitelist.namespace.as_ref(), &whitelist.uuid],
                &crate::ID,
            );
            if key != *whitelist_info.key {
                return Err(TensorWhitelistError::BadWhitelist);
            }

            Ok(WhitelistType::V2(whitelist))
        }
        _ => Err(TensorWhitelistError::BadWhitelist),
    }
}

#[cfg(test)]
mod test {
    use borsh::BorshSerialize;

    use super::*;
    use std::{cell::RefCell, rc::Rc};

    #[test]
    fn test_assert_decode_whitelist() {
        let whitelist = Whitelist::default();
        let mut data = whitelist.try_to_vec().unwrap();

        let whitelist_pubkey = Pubkey::find_program_address(&[&whitelist.uuid], &crate::ID).0;
        let mut whitelist_lamports = 2_547_360;

        let account = AccountInfo {
            key: &whitelist_pubkey,
            is_signer: false,
            is_writable: false,
            lamports: Rc::new(RefCell::new(&mut whitelist_lamports)),
            data: Rc::new(RefCell::new(data.as_mut_slice())),
            owner: &crate::ID,
            rent_epoch: 0,
            executable: false,
        };

        let decoded_whitelist = assert_decode_whitelist(&account).unwrap();

        assert_eq!(decoded_whitelist, whitelist);
    }

    #[test]
    fn test_assert_decode_generic_whitelist() {
        let whitelist = Whitelist::default();
        let mut data = whitelist.try_to_vec().unwrap();

        let whitelist_pubkey = Pubkey::find_program_address(&[&whitelist.uuid], &crate::ID).0;
        let mut whitelist_lamports = 2_547_360;

        let account = AccountInfo {
            key: &whitelist_pubkey,
            is_signer: false,
            is_writable: false,
            lamports: Rc::new(RefCell::new(&mut whitelist_lamports)),
            data: Rc::new(RefCell::new(data.as_mut_slice())),
            owner: &crate::ID,
            rent_epoch: 0,
            executable: false,
        };
        let decoded_whitelist = match assert_decode_generic_whitelist(&account).unwrap() {
            WhitelistType::V1(whitelist) => whitelist,
            WhitelistType::V2(_) => panic!("Expected V1"),
        };

        assert_eq!(decoded_whitelist, whitelist);
    }

    #[test]
    fn test_assert_decode_generic_whitelist_v2() {
        let whitelist = WhitelistV2::default();
        let mut data = whitelist.try_to_vec().unwrap();

        let whitelist_pubkey = Pubkey::find_program_address(
            &[b"whitelist", whitelist.namespace.as_ref(), &whitelist.uuid],
            &crate::ID,
        )
        .0;
        let mut whitelist_lamports = 2_547_360;

        let account = AccountInfo {
            key: &whitelist_pubkey,
            is_signer: false,
            is_writable: false,
            lamports: Rc::new(RefCell::new(&mut whitelist_lamports)),
            data: Rc::new(RefCell::new(data.as_mut_slice())),
            owner: &crate::ID,
            rent_epoch: 0,
            executable: false,
        };
        let decoded_whitelist = match assert_decode_generic_whitelist(&account).unwrap() {
            WhitelistType::V1(_) => panic!("Expected V1"),
            WhitelistType::V2(whitelist) => whitelist,
        };

        assert_eq!(decoded_whitelist, whitelist);
    }
}
