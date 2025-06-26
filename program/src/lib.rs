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
pub const CURRENT_WHITELIST_V2_VERSION: u8 = 1;

#[program]
pub mod whitelist_program {

    use super::*;

    /// Initialize or update the whitelist singleton authority.
    pub fn init_update_authority(
        ctx: Context<InitUpdateAuthority>,
        new_cosigner: Option<Pubkey>,
        new_owner: Option<Pubkey>,
    ) -> Result<()> {
        instructions::process_init_update_authority(ctx, new_cosigner, new_owner)
    }

    /// Reallocate space on the whitelist authority singleton.
    pub fn realloc_authority(ctx: Context<ReallocAuthority>) -> Result<()> {
        instructions::process_realloc_authority(ctx)
    }

    /* ------Whitelist V2------ */

    /// Create a new whitelist V2.
    pub fn create_whitelist_v2(
        ctx: Context<CreateWhitelistV2>,
        args: CreateWhitelistV2Args,
    ) -> Result<()> {
        process_create_whitelist_v2(ctx, args)
    }

    /// Close a whitelist V2.
    pub fn close_whitelist_v2(ctx: Context<CloseWhitelistV2>) -> Result<()> {
        process_close_whitelist_v2(ctx)
    }

    /// Update a whitelist V2.
    pub fn update_whitelist_v2(
        ctx: Context<UpdateWhitelistV2>,
        args: UpdateWhitelistV2Args,
    ) -> Result<()> {
        process_update_whitelist_v2(ctx, args)
    }

    /// Initialize or update a mint proof V2.
    pub fn init_update_mint_proof_v2(
        ctx: Context<InitUpdateMintProofV2>,
        proof: Vec<[u8; 32]>,
    ) -> Result<()> {
        process_init_update_mint_proof_v2(ctx, proof)
    }

    /// Close a mint proof V2.
    pub fn close_mint_proof_v2(ctx: Context<CloseMintProofV2>) -> Result<()> {
        process_close_mint_proof_v2(ctx)
    }

    /// Freeze a whitelist V2.
    pub fn freeze_whitelist_v2(ctx: Context<FreezeWhitelistV2>) -> Result<()> {
        process_freeze_whitelist_v2(ctx)
    }

    /// Unfreeze a whitelist V2.
    pub fn unfreeze_whitelist_v2(ctx: Context<UnfreezeWhitelistV2>) -> Result<()> {
        process_unfreeze_whitelist_v2(ctx)
    }
}
