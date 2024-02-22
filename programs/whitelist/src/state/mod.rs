mod authority;
mod full_merkle_proof;
mod mint_proof;
mod whitelist;

pub use authority::*;
pub use full_merkle_proof::*;
pub use mint_proof::*;
pub use whitelist::*;

/// Constant for zero array.
pub const ZERO_ARRAY: [u8; 32] = [0; 32];
