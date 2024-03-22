#![cfg(feature = "test-sbf")]

pub mod setup;
use borsh::BorshDeserialize;
use setup::*;

use solana_program_test::{tokio, ProgramTest};
use solana_sdk::{
    native_token::LAMPORTS_PER_SOL,
    pubkey::Pubkey,
    signature::{Keypair, Signer},
    transaction::Transaction,
};
use tensor_whitelist::{accounts::Authority, instructions::InitUpdateAuthorityBuilder};

#[tokio::test]
async fn initialize_new_authority() {
    let mut context = ProgramTest::new("whitelist_program", tensor_whitelist::ID, None)
        .start_with_context()
        .await;

    // Given a new cosigner and owner.

    let cosigner = Keypair::from_bytes(&COSIGNER).unwrap();
    let owner = Keypair::from_bytes(&OWNER).unwrap();
    let (authority, _) = Pubkey::find_program_address(&[], &tensor_whitelist::ID);

    airdrop(&mut context, &cosigner.pubkey(), LAMPORTS_PER_SOL)
        .await
        .unwrap();

    let ix = InitUpdateAuthorityBuilder::new()
        .whitelist_authority(authority)
        .cosigner(cosigner.pubkey())
        .new_cosigner(cosigner.pubkey())
        .owner(owner.pubkey())
        .new_owner(owner.pubkey())
        .instruction();

    // When we initialize the update authority.

    let tx = Transaction::new_signed_with_payer(
        &[ix],
        Some(&context.payer.pubkey()),
        &[&context.payer, &cosigner, &owner],
        context.last_blockhash,
    );
    context.banks_client.process_transaction(tx).await.unwrap();

    // Then an account was created with the correct data.

    let account = context.banks_client.get_account(authority).await.unwrap();

    assert!(account.is_some());

    let account = account.unwrap();
    assert_eq!(account.data.len(), Authority::LEN);

    let mut account_data = account.data.as_ref();
    let authority = Authority::deserialize(&mut account_data).unwrap();
    assert_eq!(authority.cosigner, cosigner.pubkey());
    assert_eq!(authority.owner, owner.pubkey());
}
