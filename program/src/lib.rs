// Tensor Whitelist
//
// Copyright (c) 2024 Tensor Protocol Foundation
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

mod error;
mod instructions;
mod state;

use anchor_lang::prelude::*;
pub use instructions::*;
pub use state::*;

declare_id!("TL1ST2iRBzuGTqLn1KXnGdSnEow62BzPnGiqyRXhWtW");

/// Current version of the whitelist.
pub const CURRENT_WHITELIST_VERSION: u8 = 2;

#[program]
pub mod whitelist_program {

    use super::*;

    pub fn freeze_whitelist(ctx: Context<FreezeWhitelist>) -> Result<()> {
        instructions::process_freeze_whitelist(ctx)
    }

    pub fn init_update_authority(
        ctx: Context<InitUpdateAuthority>,
        new_cosigner: Option<Pubkey>,
        new_owner: Option<Pubkey>,
    ) -> Result<()> {
        instructions::process_init_update_authority(ctx, new_cosigner, new_owner)
    }

    pub fn init_update_mint_proof(
        ctx: Context<InitUpdateMintProof>,
        proof: Vec<[u8; 32]>,
    ) -> Result<()> {
        instructions::process_init_update_mint_proof(ctx, proof)
    }

    pub fn init_update_whitelist(
        ctx: Context<InitUpdateWhitelist>,
        uuid: [u8; 32],
        root_hash: Option<[u8; 32]>,
        name: Option<[u8; 32]>,
        voc: Option<Pubkey>,
        fvc: Option<Pubkey>,
    ) -> Result<()> {
        instructions::process_init_update_whitelist(ctx, uuid, root_hash, name, voc, fvc)
    }

    pub fn realloc_authority(ctx: Context<ReallocAuthority>) -> Result<()> {
        instructions::process_realloc_authority(ctx)
    }

    pub fn realloc_whitelist(ctx: Context<ReallocWhitelist>) -> Result<()> {
        instructions::process_realloc_whitelist(ctx)
    }

    pub fn unfreeze_whitelist(ctx: Context<UnfreezeWhitelist>) -> Result<()> {
        instructions::process_unfreeze_whitelist(ctx)
    }

    /* ------WhitelistV2------ */

    pub fn create_whitelist_v2(
        ctx: Context<CreateWhitelistV2>,
        args: CreateWhitelistV2Args,
    ) -> Result<()> {
        process_create_whitelist_v2(ctx, args)
    }

    pub fn edit_whitelist_v2(
        ctx: Context<EditWhitelistV2>,
        args: EditWhitelistV2Args,
    ) -> Result<()> {
        process_edit_whitelist_v2(ctx, args)
    }
}
