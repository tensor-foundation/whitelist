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
}
