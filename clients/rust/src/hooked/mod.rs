use std::default::Default;

use solana_program::pubkey::Pubkey;

use crate::generated::{
    accounts::{Whitelist, WhitelistV2},
    types::State,
};

impl Default for Whitelist {
    fn default() -> Self {
        Self {
            discriminator: [0; 8],
            version: 0,
            bump: 0,
            verified: false,
            root_hash: [0; 32],
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
            discriminator: [0; 8],
            version: 0,
            bump: 0,
            uuid: [0; 32],
            state: State::Unfrozen,
            update_authority: Pubkey::default(),
            namespace: Pubkey::default(),
            freeze_authority: Pubkey::default(),
            conditions: vec![],
        }
    }
}
