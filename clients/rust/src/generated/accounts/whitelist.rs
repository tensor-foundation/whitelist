//! This code was AUTOGENERATED using the kinobi library.
//! Please DO NOT EDIT THIS FILE, instead use visitors
//! to add features, then rerun kinobi to update it.
//!
//! <https://github.com/kinobi-so/kinobi>
//!

use borsh::BorshDeserialize;
use borsh::BorshSerialize;
use solana_program::pubkey::Pubkey;

#[derive(BorshSerialize, BorshDeserialize, Clone, Debug, Eq, PartialEq)]
#[cfg_attr(feature = "serde", derive(serde::Serialize, serde::Deserialize))]
pub struct Whitelist {
    pub discriminator: [u8; 8],
    pub version: u8,
    pub bump: u8,
    /// DEPRECATED, doesn't do anything
    pub verified: bool,
    /// in the case when not present will be [u8; 32]
    pub root_hash: [u8; 32],
    pub uuid: [u8; 32],
    pub name: [u8; 32],
    pub frozen: bool,
    pub voc: Option<Pubkey>,
    pub fvc: Option<Pubkey>,
    #[cfg_attr(feature = "serde", serde(with = "serde_with::As::<serde_with::Bytes>"))]
    pub reserved: [u8; 64],
}

impl Whitelist {
    pub const LEN: usize = 238;

    pub fn create_pda(
        uuid: [u8; 32],
        bump: u8,
    ) -> Result<solana_program::pubkey::Pubkey, solana_program::pubkey::PubkeyError> {
        solana_program::pubkey::Pubkey::create_program_address(
            &[&uuid, &[bump]],
            &crate::TENSOR_WHITELIST_ID,
        )
    }

    pub fn find_pda(uuid: [u8; 32]) -> (solana_program::pubkey::Pubkey, u8) {
        solana_program::pubkey::Pubkey::find_program_address(&[&uuid], &crate::TENSOR_WHITELIST_ID)
    }

    #[inline(always)]
    pub fn from_bytes(data: &[u8]) -> Result<Self, std::io::Error> {
        let mut data = data;
        Self::deserialize(&mut data)
    }
}

impl<'a> TryFrom<&solana_program::account_info::AccountInfo<'a>> for Whitelist {
    type Error = std::io::Error;

    fn try_from(
        account_info: &solana_program::account_info::AccountInfo<'a>,
    ) -> Result<Self, Self::Error> {
        let mut data: &[u8] = &(*account_info.data).borrow();
        Self::deserialize(&mut data)
    }
}
