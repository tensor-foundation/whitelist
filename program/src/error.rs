use anchor_lang::prelude::*;

#[error_code]
pub enum ErrorCode {
    #[msg("passed in cosigner doesnt have the rights to do this")]
    BadCosigner = 0,

    #[msg("missing all 3 verification methods: at least one must be present")]
    MissingVerification = 1,

    #[msg("missing name")]
    MissingName = 2,

    #[msg("bad whitelist")]
    BadWhitelist = 3,

    #[msg("proof provided exceeds the limit of 32 hashes")]
    ProofTooLong = 4,

    #[msg("passed in owner doesnt have the rights to do this")]
    BadOwner = 5,

    #[msg("failed voc verification")]
    FailedVocVerification = 6,

    #[msg("failed fvc verification")]
    FailedFvcVerification = 7,

    #[msg("failed merkle proof verification")]
    FailedMerkleProofVerification = 8,

    #[msg("no whitelist conditions provided")]
    NoConditions = 9,

    #[msg("invalid authority")]
    InvalidAuthority = 10,

    #[msg("condition at index not a merkle root")]
    NotMerkleRoot = 11,

    #[msg("invalid whitelist index")]
    InvalidWhitelistIndex = 12,

    #[msg("too many conditions")]
    TooManyConditions = 13,

    #[msg("cannot have empty conditions")]
    EmptyConditions = 14,

    #[msg("too many merkle proofs")]
    TooManyMerkleProofs = 15,

    #[msg("whitelist is frozen")]
    WhitelistIsFrozen = 16,

    #[msg("bad mint proof")]
    BadMintProof = 17,

    #[msg("missing mint proof")]
    MissingMintProof = 18,
}
