mod authority;
mod full_merkle_proof;
mod mint_proof;
mod whitelist;

pub use authority::*;
pub use full_merkle_proof::*;
pub use mint_proof::*;
use tensor_toolbox::token_metadata::assert_decode_metadata;
pub use whitelist::*;

// V2
mod mint_proof_v2;
mod whitelist_v2;

pub use mint_proof_v2::*;
pub use whitelist_v2::*;

use anchor_lang::{prelude::*, solana_program::keccak, AccountDeserialize};
use tensor_vipers::throw_err;

use crate::error::ErrorCode;

// Constant for zero array.
pub const ZERO_ARRAY: [u8; 32] = [0; 32];

/// Whitelist Anchor account discriminator.
const WHITELIST_DISCRIMINATOR: [u8; 8] = [204, 176, 52, 79, 146, 121, 54, 247];

/// WhitelistV2 Anchor account discriminator.
const WHITELIST_V2_DISCRIMINATOR: [u8; 8] = [136, 184, 45, 191, 85, 203, 191, 119];

/// MintProo Anchor account discriminator.
const MINT_PROOF_DISCRIMINATOR: [u8; 8] = [227, 131, 106, 240, 190, 48, 219, 228];

/// MintProoV2 Anchor account discriminator.
const MINT_PROOF_V2_DISCRIMINATOR: [u8; 8] = [22, 197, 150, 178, 249, 225, 183, 75];

const DISCRIMINATOR_SIZE: usize = 8;

#[inline(never)]
pub fn verify_whitelist(
    whitelist: &Whitelist,
    whitelist_pubkey: &Pubkey,
    mint_proof: &AccountInfo,
    mint_pubkey: &Pubkey,
    metadata_opt: Option<&AccountInfo>,
) -> Result<()> {
    //prioritize merkle tree if proof present
    if whitelist.root_hash != ZERO_ARRAY {
        let mint_proof_type =
            assert_decode_mint_proof_generic(whitelist_pubkey, mint_pubkey, mint_proof)?;

        let leaf = anchor_lang::solana_program::keccak::hash(mint_pubkey.as_ref());

        let proof = match mint_proof_type {
            MintProofType::V1(mint_proof) => {
                let mut proof = mint_proof.proof.to_vec();
                proof.truncate(mint_proof.proof_len as usize);
                proof
            }
            MintProofType::V2(mint_proof) => {
                let mut proof = mint_proof.proof.to_vec();
                proof.truncate(mint_proof.proof_len as usize);
                proof
            }
        };

        whitelist.verify_whitelist(
            None,
            Some(FullMerkleProof {
                proof: proof.clone(),
                leaf: leaf.0,
            }),
        )
    } else if let Some(nft_metadata) = metadata_opt {
        let metadata = &assert_decode_metadata(mint_pubkey, nft_metadata)?;
        whitelist.verify_whitelist(Some(metadata), None)
    } else {
        throw_err!(ErrorCode::BadMintProof);
    }
}

#[inline(never)]
pub fn verify_whitelist_v2(
    whitelist: &WhitelistV2,
    whitelist_pubkey: &Pubkey,
    mint_proof_opt: Option<&AccountInfo>,
    mint: &Pubkey,
    metadata_opt: Option<&AccountInfo>,
) -> Result<()> {
    let full_merkle_proof = if let Some(mint_proof_info) = &mint_proof_opt {
        let mint_proof_type =
            assert_decode_mint_proof_generic(whitelist_pubkey, mint, mint_proof_info)?;

        let leaf = keccak::hash(mint.key().as_ref());

        let proof = match mint_proof_type {
            MintProofType::V1(mint_proof) => {
                let mut proof = mint_proof.proof.to_vec();
                proof.truncate(mint_proof.proof_len as usize);
                proof
            }
            MintProofType::V2(mint_proof) => {
                let mut proof = mint_proof.proof.to_vec();
                proof.truncate(mint_proof.proof_len as usize);
                proof
            }
        };
        Some(FullMerkleProof {
            leaf: leaf.0,
            proof: proof.clone(),
        })
    } else {
        None
    };

    let metadata_opt = if let Some(metadata) = metadata_opt {
        let metadata = assert_decode_metadata(&mint.key(), metadata)?;
        Some(metadata)
    } else {
        None
    };

    let collection_opt = metadata_opt.as_ref().and_then(|m| m.collection.clone());
    let creators_opt = metadata_opt.as_ref().and_then(|m| m.creators.clone());

    whitelist.verify(&collection_opt, &creators_opt, &full_merkle_proof)
}

#[inline(never)]
pub fn verify_whitelist_generic(
    whitelist_info: &AccountInfo,
    mint_proof_info_opt: Option<&AccountInfo>,
    mint_info: &AccountInfo,
    metadata_info_opt: Option<&AccountInfo>,
) -> Result<()> {
    let whitelist_type =
        assert_decode_whitelist_generic(whitelist_info).map_err(|_| ErrorCode::BadWhitelist)?;

    match whitelist_type {
        WhitelistType::V1(whitelist) => {
            // Must have a mint proof account.
            require!(mint_proof_info_opt.is_some(), ErrorCode::MissingMintProof);

            verify_whitelist(
                &whitelist,
                whitelist_info.key,
                mint_proof_info_opt.unwrap(),
                mint_info.key,
                metadata_info_opt,
            )
        }
        WhitelistType::V2(whitelist) => verify_whitelist_v2(
            &whitelist,
            whitelist_info.key,
            mint_proof_info_opt,
            mint_info.key,
            metadata_info_opt,
        ),
    }
}

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

#[derive(Debug, Clone, Eq, PartialEq)]
pub enum WhitelistType {
    V1(Whitelist),
    V2(WhitelistV2),
}

/// Temporary function to decode both whitelist versions, will be removed after WhitelistV1s are migrated to V2.
#[inline(never)]
pub fn assert_decode_whitelist_generic(whitelist_info: &AccountInfo) -> Result<WhitelistType> {
    let data: &[u8] = &whitelist_info.try_borrow_data()?;

    if data.len() < 8 {
        return Err(ProgramError::InvalidAccountData.into());
    }

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

    if data.is_empty() {
        return Err(ErrorCode::BadMintProof.into());
    }

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

    if data.is_empty() {
        return Err(ErrorCode::BadMintProof.into());
    }

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

    if data.is_empty() {
        return Err(ErrorCode::BadMintProof.into());
    }

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

    macro_rules! taccount {
        ($key:expr, $lamports:expr, $data:expr) => {
            AccountInfo {
                key: $key,
                is_signer: false,
                is_writable: false,
                lamports: Rc::new(RefCell::new($lamports)),
                data: Rc::new(RefCell::new($data)),
                owner: &crate::ID,
                rent_epoch: 0,
                executable: false,
            }
        };
    }

    struct TestWhitelist {
        pubkey: Pubkey,
        whitelist: Whitelist,
        data: Vec<u8>,
    }

    struct TestWhitelistV2 {
        pubkey: Pubkey,
        whitelist: WhitelistV2,
        data: Vec<u8>,
    }

    struct TestMintProof {
        pubkey: Pubkey,
        mint_proof: MintProof,
        data: Vec<u8>,
    }

    struct TestMintProofV2 {
        pubkey: Pubkey,
        mint_proof: MintProofV2,
        data: Vec<u8>,
    }

    const WHITELIST_MIN_RENT: u64 = 2_547_360;
    const WHITELIST_V2_BASE_MIN_RENT: u64 = 2_547_360;
    const MINT_PROOF_V2_LAMPORTS: u64 = 7_461_120;

    fn setup_whitelist() -> TestWhitelist {
        let whitelist = Whitelist::default();
        let mut data = Vec::with_capacity(WHITELIST_SIZE);
        data.extend(WHITELIST_DISCRIMINATOR);
        data.extend(whitelist.try_to_vec().unwrap());
        TestWhitelist {
            pubkey: Pubkey::find_program_address(&[&whitelist.uuid], &crate::ID).0,
            whitelist,
            data,
        }
    }

    fn setup_whitelist_v2() -> TestWhitelistV2 {
        let whitelist = WhitelistV2::default();
        let mut data = Vec::with_capacity(WHITELIST_V2_BASE_SIZE);
        data.extend(WHITELIST_V2_DISCRIMINATOR);
        data.extend(whitelist.try_to_vec().unwrap());
        TestWhitelistV2 {
            pubkey: Pubkey::find_program_address(
                &[b"whitelist", whitelist.namespace.as_ref(), &whitelist.uuid],
                &crate::ID,
            )
            .0,
            whitelist,
            data,
        }
    }

    fn setup_mint_proof(mint_pubkey: Pubkey, whitelist_pubkey: Pubkey) -> TestMintProof {
        let mint_proof = MintProof::default();
        let mut data = Vec::with_capacity(MINT_PROOF_SIZE);
        data.extend(MINT_PROOF_DISCRIMINATOR);
        data.extend(mint_proof.try_to_vec().unwrap());
        TestMintProof {
            pubkey: Pubkey::find_program_address(
                &[
                    MintProof::PREFIX,
                    mint_pubkey.key().as_ref(),
                    whitelist_pubkey.key().as_ref(),
                ],
                &crate::ID,
            )
            .0,
            mint_proof,
            data,
        }
    }

    fn setup_mint_proof_v2(mint_pubkey: Pubkey, whitelist_pubkey: Pubkey) -> TestMintProofV2 {
        let mint_proof = MintProofV2::default();
        let mut data = Vec::with_capacity(MintProofV2::SIZE);
        data.extend(MINT_PROOF_V2_DISCRIMINATOR);
        data.extend(mint_proof.try_to_vec().unwrap());
        TestMintProofV2 {
            pubkey: Pubkey::find_program_address(
                &[
                    MintProofV2::PREFIX,
                    mint_pubkey.key().as_ref(),
                    whitelist_pubkey.key().as_ref(),
                ],
                &crate::ID,
            )
            .0,
            mint_proof,
            data,
        }
    }

    #[test]
    fn test_assert_decode_whitelist() {
        let TestWhitelist {
            pubkey: whitelist_pubkey,
            whitelist,
            mut data,
        } = setup_whitelist();

        let mut whitelist_lamports = WHITELIST_MIN_RENT;

        let account = taccount!(
            &whitelist_pubkey,
            &mut whitelist_lamports,
            data.as_mut_slice()
        );

        let decoded_whitelist = assert_decode_whitelist(&account).unwrap();

        assert_eq!(decoded_whitelist, whitelist);
    }

    #[test]
    fn test_assert_decode_whitelist_with_v2_fails() {
        let TestWhitelistV2 {
            pubkey: whitelist_pubkey,
            whitelist: _,
            mut data,
        } = setup_whitelist_v2();

        let mut whitelist_lamports = WHITELIST_V2_BASE_MIN_RENT;

        let account = taccount!(
            &whitelist_pubkey,
            &mut whitelist_lamports,
            data.as_mut_slice()
        );

        assert_decode_whitelist(&account).unwrap_err();
    }

    #[test]
    fn test_assert_decode_whitelist_v2() {
        let TestWhitelistV2 {
            pubkey: whitelist_pubkey,
            whitelist,
            mut data,
        } = setup_whitelist_v2();

        let mut whitelist_lamports = WHITELIST_V2_BASE_MIN_RENT;

        let account = taccount!(
            &whitelist_pubkey,
            &mut whitelist_lamports,
            data.as_mut_slice()
        );

        let decoded_whitelist = assert_decode_whitelist_v2(&account).unwrap();

        assert_eq!(decoded_whitelist, whitelist);
    }

    #[test]
    fn test_assert_decode_whitelist_v2_with_v1_fails() {
        let TestWhitelist {
            pubkey: whitelist_pubkey,
            whitelist: _,
            mut data,
        } = setup_whitelist();

        let mut whitelist_lamports = WHITELIST_MIN_RENT;

        let account = taccount!(
            &whitelist_pubkey,
            &mut whitelist_lamports,
            data.as_mut_slice()
        );

        assert_decode_whitelist_v2(&account).unwrap_err();
    }

    #[test]
    fn test_assert_decode_whitelist_generic_on_whitelist() {
        let TestWhitelist {
            pubkey: whitelist_pubkey,
            whitelist,
            mut data,
        } = setup_whitelist();

        let mut whitelist_lamports = WHITELIST_MIN_RENT;

        let account = taccount!(
            &whitelist_pubkey,
            &mut whitelist_lamports,
            data.as_mut_slice()
        );

        let decoded_whitelist = match assert_decode_whitelist_generic(&account).unwrap() {
            WhitelistType::V1(whitelist) => whitelist,
            WhitelistType::V2(_) => panic!("Expected V1"),
        };

        assert_eq!(decoded_whitelist, whitelist);
    }

    #[test]
    fn test_assert_decode_whitelist_generic_on_whitelist_v2() {
        let TestWhitelistV2 {
            pubkey: whitelist_pubkey,
            whitelist,
            mut data,
        } = setup_whitelist_v2();

        let mut whitelist_lamports = WHITELIST_V2_BASE_MIN_RENT;

        let account = taccount!(
            &whitelist_pubkey,
            &mut whitelist_lamports,
            data.as_mut_slice()
        );

        let decoded_whitelist = match assert_decode_whitelist_generic(&account).unwrap() {
            WhitelistType::V1(_) => panic!("Expected V1"),
            WhitelistType::V2(whitelist) => whitelist,
        };

        assert_eq!(decoded_whitelist, whitelist);
    }

    #[test]
    fn test_assert_decode_whitelist_generic_invalid_program_owner_fails() {
        let TestWhitelistV2 {
            pubkey: whitelist_pubkey,
            whitelist: _,
            mut data,
        } = setup_whitelist_v2();

        let mut whitelist_lamports = WHITELIST_V2_BASE_MIN_RENT;
        let wrong_owner = Pubkey::default();

        let mut account = taccount!(
            &whitelist_pubkey,
            &mut whitelist_lamports,
            data.as_mut_slice()
        );
        account.owner = &wrong_owner;

        assert_decode_whitelist_generic(&account).unwrap_err();

        let another_wrong_owner = tensor_toolbox::escrow::ID;
        account.owner = &another_wrong_owner;

        assert_decode_whitelist_generic(&account).unwrap_err();
    }

    #[test]
    fn test_assert_decode_whitelist_generic_uninitialized_account_fails() {
        let TestWhitelistV2 {
            pubkey: whitelist_pubkey,
            whitelist: _,
            mut data,
        } = setup_whitelist_v2();

        let mut whitelist_lamports = WHITELIST_V2_BASE_MIN_RENT;

        // Data but uninitalized discriminator.
        data[0..8].copy_from_slice(&[0u8; 8]);
        let account = taccount!(
            &whitelist_pubkey,
            &mut whitelist_lamports,
            data.as_mut_slice()
        );
        assert_decode_whitelist_generic(&account).unwrap_err();

        // All 0's.
        data.fill(0);
        let account = taccount!(
            &whitelist_pubkey,
            &mut whitelist_lamports,
            data.as_mut_slice()
        );
        assert_decode_whitelist_generic(&account).unwrap_err();

        // No data.
        let account = taccount!(&whitelist_pubkey, &mut whitelist_lamports, &mut []);
        assert_decode_whitelist_generic(&account).unwrap_err();
    }

    #[test]
    fn test_assert_decode_mint_proof_generic_on_mint_proof() {
        let TestWhitelistV2 {
            pubkey: whitelist_pubkey,
            whitelist: _,
            data: mut whitelist_data,
        } = setup_whitelist_v2();

        let mint_pubkey = Pubkey::new_unique();

        let TestMintProof {
            pubkey: mint_proof_pubkey,
            mint_proof,
            data: mut mint_proof_data,
        } = setup_mint_proof(mint_pubkey, whitelist_pubkey);

        let mut whitelist_lamports = WHITELIST_V2_BASE_MIN_RENT;

        let whitelist_info = taccount!(
            &whitelist_pubkey,
            &mut whitelist_lamports,
            whitelist_data.as_mut_slice()
        );

        let mut mint_proof_lamports = MINT_PROOF_V2_LAMPORTS;

        let mint_proof_info = taccount!(
            &mint_proof_pubkey,
            &mut mint_proof_lamports,
            mint_proof_data.as_mut_slice()
        );

        let decoded_mint_proof = match assert_decode_mint_proof_generic(
            &whitelist_info.key(),
            &mint_pubkey,
            &mint_proof_info,
        )
        .unwrap()
        {
            MintProofType::V1(mp) => mp,
            MintProofType::V2(_) => panic!("Expected V1"),
        };

        assert_eq!(decoded_mint_proof, mint_proof);
    }

    #[test]
    fn test_assert_decode_mint_proof_generic_on_mint_proof_v2() {
        let TestWhitelistV2 {
            pubkey: whitelist_pubkey,
            whitelist: _,
            data: mut whitelist_data,
        } = setup_whitelist_v2();

        let mint_pubkey = Pubkey::new_unique();

        let TestMintProofV2 {
            pubkey: mint_proof_pubkey,
            mint_proof,
            data: mut mint_proof_data,
        } = setup_mint_proof_v2(mint_pubkey, whitelist_pubkey);

        let mut whitelist_lamports = WHITELIST_V2_BASE_MIN_RENT;

        let whitelist_info = taccount!(
            &whitelist_pubkey,
            &mut whitelist_lamports,
            whitelist_data.as_mut_slice()
        );

        let mut mint_proof_lamports = MINT_PROOF_V2_LAMPORTS;

        let mint_proof_info = taccount!(
            &mint_proof_pubkey,
            &mut mint_proof_lamports,
            mint_proof_data.as_mut_slice()
        );

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
