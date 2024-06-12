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
use vipers::throw_err;

use crate::error::ErrorCode;

// Constant for zero array.
pub const ZERO_ARRAY: [u8; 32] = [0; 32];

/// Borsh prefix size for a vector.
pub const VEC_LENGTH: usize = 4;

/// Whitelist Anchor account discriminator.
const WHITELIST_DISCRIMINATOR: [u8; 8] = [204, 176, 52, 79, 146, 121, 54, 247];

/// WhitelistV2 Anchor account discriminator.
const WHITELIST_V2_DISCRIMINATOR: [u8; 8] = [136, 184, 45, 191, 85, 203, 191, 119];

/// MintProo Anchor account discriminator.
const MINT_PROOF_DISCRIMINATOR: [u8; 8] = [227, 131, 106, 240, 190, 48, 219, 228];

/// MintProoV2 Anchor account discriminator.
const MINT_PROOF_V2_DISCRIMINATOR: [u8; 8] = [22, 197, 150, 178, 249, 225, 183, 75];

/// Decode a whitelist account.
// Upgrade to V2 after migration.
#[inline(never)]
pub fn assert_decode_whitelist(whitelist_info: &AccountInfo) -> Result<Whitelist> {
    // Deserialize.
    let mut data: &[u8] = &whitelist_info.try_borrow_data()?;
    let whitelist: Whitelist = AccountDeserialize::try_deserialize(&mut data)?;

    // PDA check.
    let (key, _) = Pubkey::find_program_address(&[&whitelist.uuid], &crate::ID);
    if key != *whitelist_info.key {
        throw_err!(ErrorCode::BadWhitelist);
    }

    // Program owner check.
    if *whitelist_info.owner != crate::ID {
        throw_err!(ErrorCode::BadWhitelist);
    }

    Ok(whitelist)
}

/// Decode a whitelist_v2 account.
#[inline(never)]
pub fn assert_decode_whitelist_v2(whitelist_info: &AccountInfo) -> Result<WhitelistV2> {
    // Deserialize.
    let mut data: &[u8] = &whitelist_info.try_borrow_data()?;
    let whitelist: WhitelistV2 = AccountDeserialize::try_deserialize(&mut data)?;

    // PDA check.
    let (key, _) = Pubkey::find_program_address(
        &[
            WhitelistV2::PREFIX,
            whitelist.namespace.as_ref(),
            &whitelist.uuid,
        ],
        &crate::ID,
    );
    if key != *whitelist_info.key {
        return Err(ErrorCode::BadWhitelist.into());
    }

    // Program owner check.
    if *whitelist_info.owner != crate::ID {
        throw_err!(ErrorCode::BadWhitelist);
    }

    Ok(whitelist)
}

pub enum WhitelistType {
    V1(Whitelist),
    V2(WhitelistV2),
}

/// Temporary function to decode both whitelist versions, will be removed after WhitelistV1s are migrated to V2.
#[inline(never)]
pub fn assert_decode_whitelist_generic(whitelist_info: &AccountInfo) -> Result<WhitelistType> {
    let data: &[u8] = &whitelist_info.try_borrow_data()?;

    let discriminator: [u8; 8] = data[0..8]
        .try_into()
        .map_err(|_| ProgramError::InvalidAccountData)?;

    match discriminator {
        WHITELIST_DISCRIMINATOR => assert_decode_whitelist(whitelist_info).map(WhitelistType::V1),
        WHITELIST_V2_DISCRIMINATOR => {
            assert_decode_whitelist_v2(whitelist_info).map(WhitelistType::V2)
        }
        _ => Err(ErrorCode::BadWhitelist.into()),
    }
}

/// Decode a mint proof account.
#[inline(never)]
pub fn assert_decode_mint_proof(
    whitelist: &Pubkey,
    nft_mint: &Pubkey,
    mint_proof_info: &AccountInfo,
) -> Result<MintProof> {
    // Deserialize.
    let mut data: &[u8] = &mint_proof_info.try_borrow_data()?;
    let mint_proof: MintProof = AccountDeserialize::try_deserialize(&mut data)?;

    // PDA check.
    let (key, _) = Pubkey::find_program_address(
        &[
            MintProof::PREFIX,
            nft_mint.key().as_ref(),
            whitelist.as_ref(),
        ],
        &crate::ID,
    );
    if key != *mint_proof_info.key {
        throw_err!(ErrorCode::BadMintProof);
    }

    // Program owner check.
    if *mint_proof_info.owner != crate::ID {
        throw_err!(ErrorCode::BadMintProof);
    }

    Ok(mint_proof)
}

/// Decode a mint proof v2 account.
#[inline(never)]
pub fn assert_decode_mint_proof_v2(
    whitelist: &Pubkey,
    nft_mint: &Pubkey,
    mint_proof_info: &AccountInfo,
) -> Result<MintProofV2> {
    // Deserialize.
    let mut data: &[u8] = &mint_proof_info.try_borrow_data()?;
    let mint_proof: MintProofV2 = AccountDeserialize::try_deserialize(&mut data)?;

    // PDA check.
    let (key, _) = Pubkey::find_program_address(
        &[
            MintProofV2::PREFIX,
            nft_mint.key().as_ref(),
            whitelist.as_ref(),
        ],
        &crate::ID,
    );
    if key != *mint_proof_info.key {
        throw_err!(ErrorCode::BadMintProof);
    }

    // Program owner check.
    if *mint_proof_info.owner != crate::ID {
        throw_err!(ErrorCode::BadMintProof);
    }

    Ok(mint_proof)
}

pub enum MintProofType {
    V1(MintProof),
    V2(MintProofV2),
}

/// Decode both mint proof versions.
#[inline(never)]
pub fn assert_decode_mint_proof_generic(
    whitelist: &Pubkey,
    nft_mint: &Pubkey,
    mint_proof: &AccountInfo,
) -> Result<MintProofType> {
    let data: &[u8] = &mint_proof.try_borrow_data()?;
    let discriminator: [u8; 8] = data[0..8]
        .try_into()
        .map_err(|_| ProgramError::InvalidAccountData)?;

    match discriminator {
        MINT_PROOF_DISCRIMINATOR => {
            assert_decode_mint_proof(whitelist, nft_mint, mint_proof).map(MintProofType::V1)
        }
        MINT_PROOF_V2_DISCRIMINATOR => {
            assert_decode_mint_proof_v2(whitelist, nft_mint, mint_proof).map(MintProofType::V2)
        }
        _ => Err(ErrorCode::BadMintProof.into()),
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
        let mut data = Vec::with_capacity(WHITELIST_SIZE);
        data.extend(WHITELIST_DISCRIMINATOR);
        data.extend(whitelist.try_to_vec().unwrap());

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
    fn test_assert_decode_whitelist_generic_on_whitelist() {
        let whitelist = Whitelist::default();
        let mut data = Vec::with_capacity(WHITELIST_SIZE);
        data.extend(WHITELIST_DISCRIMINATOR);
        data.extend(whitelist.try_to_vec().unwrap());

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
        let decoded_whitelist = match assert_decode_whitelist_generic(&account).unwrap() {
            WhitelistType::V1(whitelist) => whitelist,
            WhitelistType::V2(_) => panic!("Expected V1"),
        };

        assert_eq!(decoded_whitelist, whitelist);
    }

    #[test]
    fn test_assert_decode_whitelist_generic_on_whitelist_v2() {
        let whitelist = WhitelistV2::default();
        let mut data = vec![];
        data.extend(WHITELIST_V2_DISCRIMINATOR);
        data.extend(whitelist.try_to_vec().unwrap());

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
        let decoded_whitelist = match assert_decode_whitelist_generic(&account).unwrap() {
            WhitelistType::V1(_) => panic!("Expected V1"),
            WhitelistType::V2(whitelist) => whitelist,
        };

        assert_eq!(decoded_whitelist, whitelist);
    }

    #[test]
    fn test_assert_decode_mint_proof_generic_on_mint_proof() {
        let whitelist = WhitelistV2::default();
        let mint_proof = MintProof::default();

        let mint_pubkey = Pubkey::new_unique();

        let mut whitelist_data = Vec::with_capacity(WHITELIST_SIZE);
        whitelist_data.extend(WHITELIST_DISCRIMINATOR);
        whitelist_data.extend(whitelist.try_to_vec().unwrap());

        let mut mint_proof_data = Vec::with_capacity(MINT_PROOF_SIZE);
        mint_proof_data.extend(MINT_PROOF_DISCRIMINATOR);
        mint_proof_data.extend(mint_proof.try_to_vec().unwrap());

        let whitelist_pubkey = Pubkey::find_program_address(&[&whitelist.uuid], &crate::ID).0;
        let mut whitelist_lamports = 2_547_360;

        let whitelist_info = AccountInfo {
            key: &whitelist_pubkey,
            is_signer: false,
            is_writable: false,
            lamports: Rc::new(RefCell::new(&mut whitelist_lamports)),
            data: Rc::new(RefCell::new(whitelist_data.as_mut_slice())),
            owner: &crate::ID,
            rent_epoch: 0,
            executable: false,
        };

        let mint_proof_pubkey = Pubkey::find_program_address(
            &[
                MintProof::PREFIX,
                mint_pubkey.key().as_ref(),
                whitelist_pubkey.key().as_ref(),
            ],
            &crate::ID,
        )
        .0;
        let mut mint_proof_lamports = 1_000_000_000;

        let mint_proof_info = AccountInfo {
            key: &mint_proof_pubkey,
            is_signer: false,
            is_writable: false,
            lamports: Rc::new(RefCell::new(&mut mint_proof_lamports)),
            data: Rc::new(RefCell::new(mint_proof_data.as_mut_slice())),
            owner: &crate::ID,
            rent_epoch: 0,
            executable: false,
        };

        let decoded_mint_proof = match assert_decode_mint_proof_generic(
            &whitelist_info.key(),
            &mint_pubkey,
            &mint_proof_info,
        )
        .unwrap()
        {
            MintProofType::V1(mint_proof) => mint_proof,
            MintProofType::V2(_) => panic!("Expected V1"),
        };

        assert_eq!(decoded_mint_proof, mint_proof);
    }

    #[test]
    fn test_assert_decode_mint_proof_generic_on_mint_proof_v2() {
        let whitelist = WhitelistV2::default();
        let mint_proof = MintProofV2::default();

        let mint_pubkey = Pubkey::new_unique();

        let mut whitelist_data = vec![];
        whitelist_data.extend(WHITELIST_V2_DISCRIMINATOR);
        whitelist_data.extend(whitelist.try_to_vec().unwrap());

        let mut mint_proof_data = Vec::with_capacity(MINT_PROOF_V2_SIZE);
        mint_proof_data.extend(MINT_PROOF_V2_DISCRIMINATOR);
        mint_proof_data.extend(mint_proof.try_to_vec().unwrap());

        let whitelist_pubkey = Pubkey::find_program_address(
            &[b"whitelist", whitelist.namespace.as_ref(), &whitelist.uuid],
            &crate::ID,
        )
        .0;
        let mut whitelist_lamports = 2_547_360;

        let whitelist_info = AccountInfo {
            key: &whitelist_pubkey,
            is_signer: false,
            is_writable: false,
            lamports: Rc::new(RefCell::new(&mut whitelist_lamports)),
            data: Rc::new(RefCell::new(whitelist_data.as_mut_slice())),
            owner: &crate::ID,
            rent_epoch: 0,
            executable: false,
        };

        let mint_proof_pubkey = Pubkey::find_program_address(
            &[
                MintProofV2::PREFIX,
                mint_pubkey.key().as_ref(),
                whitelist_pubkey.key().as_ref(),
            ],
            &crate::ID,
        )
        .0;
        let mut mint_proof_lamports = 1_000_000_000;

        let mint_proof_info = AccountInfo {
            key: &mint_proof_pubkey,
            is_signer: false,
            is_writable: false,
            lamports: Rc::new(RefCell::new(&mut mint_proof_lamports)),
            data: Rc::new(RefCell::new(mint_proof_data.as_mut_slice())),
            owner: &crate::ID,
            rent_epoch: 0,
            executable: false,
        };

        let decoded_mint_proof = match assert_decode_mint_proof_generic(
            &whitelist_info.key(),
            &mint_pubkey,
            &mint_proof_info,
        )
        .unwrap()
        {
            MintProofType::V1(_) => panic!("Expected V2"),
            MintProofType::V2(mint_proof) => mint_proof,
        };

        assert_eq!(decoded_mint_proof, mint_proof);
    }
}
