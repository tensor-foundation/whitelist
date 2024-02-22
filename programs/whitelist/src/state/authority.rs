use anchor_lang::prelude::*;

// (!) INCLUSIVE of discriminator (8 bytes)
#[constant]
#[allow(clippy::identity_op)]
pub const AUTHORITY_SIZE: usize = 8 + 1 + (32 * 2) + 64;

#[account]
pub struct Authority {
    pub bump: u8,
    /// cosigner of the whitelist - has rights to update it if unfrozen
    pub cosigner: Pubkey,
    /// owner of the whitelist (stricter, should be handled more carefully)
    /// has rights to 1)freeze, 2)unfreeze, 3)update frozen whitelists
    pub owner: Pubkey,
    pub _reserved: [u8; 64],
}
