use anchor_lang::prelude::*;

#[derive(AnchorSerialize, AnchorDeserialize, Debug, Clone)]
pub struct FullMerkleProof {
    pub proof: Vec<[u8; 32]>,
    pub leaf: [u8; 32],
}
