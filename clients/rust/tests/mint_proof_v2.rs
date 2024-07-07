#![cfg(feature = "test-sbf")]
pub mod setup;

use solana_program_test::tokio;
use solana_sdk::{
    keccak::hash, pubkey::Pubkey, signature::Keypair, signer::Signer, transaction::Transaction,
};
use spl_merkle_tree_reference::{MerkleTree, EMPTY};
use tensor_whitelist::{
    accounts::{MintProofV2, WhitelistV2},
    instructions::{CloseMintProofV2, InitUpdateMintProofV2, InitUpdateMintProofV2InstructionArgs},
    types::{Condition, Mode},
};

use crate::setup::{
    airdrop, fetch, mint_metaplex_nft, program_context, setup_default_whitelist_v2, DirtyClone,
    TestMintMetaplexNftInputs, TestWhitelistV2Inputs, ONE_SOL_LAMPORTS,
};

#[tokio::test]
async fn create_and_close_mint_proof_v2() {
    let mut context = program_context().await;

    let payer = Keypair::new();
    let update_authority = Keypair::new();

    airdrop(&mut context, &payer.pubkey(), ONE_SOL_LAMPORTS)
        .await
        .unwrap();

    airdrop(&mut context, &update_authority.pubkey(), ONE_SOL_LAMPORTS)
        .await
        .unwrap();

    // Mint an NFT.
    let inputs = TestMintMetaplexNftInputs {
        payer: None, // defaults to update authority
        update_authority: update_authority.dirty_clone(),
        owner: None, // defaults to update authority
    };
    let nft = mint_metaplex_nft(&mut context, inputs).await;

    let leaf = hash(nft.mint.as_ref());
    let mut leaves = vec![leaf.0];

    leaves.push(hash(&EMPTY).0);
    leaves.sort();

    let index = leaves.iter().position(|x| x == &leaf.0).unwrap();

    // Simple Merkle tree.
    let tree = MerkleTree::new(&leaves);

    // Get the root proof.
    let root = tree.get_root();

    // Get the proof for the leaf.
    let proof = tree.get_proof_of_leaf(index);

    let conditions = vec![Condition {
        mode: Mode::MerkleTree,
        value: Pubkey::new_from_array(root), // pubkey type on-chain for convenience
    }];

    // Create a whitelist with the merkle tree as a condition.
    let inputs = TestWhitelistV2Inputs {
        update_authority: update_authority.dirty_clone(),
        conditions: Some(conditions.clone()),
        ..TestWhitelistV2Inputs::default()
    };
    let test_whitelist = setup_default_whitelist_v2(&mut context, inputs).await;

    let whitelist_data: WhitelistV2 = fetch(&test_whitelist.whitelist, &mut context)
        .await
        .unwrap();

    assert_eq!(whitelist_data.conditions.len(), conditions.len());
    assert_eq!(whitelist_data.uuid, test_whitelist.uuid);
    assert_eq!(whitelist_data.namespace, test_whitelist.namespace);
    assert_eq!(whitelist_data.update_authority, update_authority.pubkey());

    // Warp 100 slots so we can check the created at slot.
    context.warp_to_slot(100).unwrap();

    let args = InitUpdateMintProofV2InstructionArgs {
        proof: proof.clone(),
    };

    let mint_proof = MintProofV2::find_pda(&nft.mint, &test_whitelist.whitelist).0;

    let ix = InitUpdateMintProofV2 {
        whitelist: test_whitelist.whitelist,
        payer: payer.pubkey(),
        mint: nft.mint,
        mint_proof,
        system_program: solana_program::system_program::ID,
    }
    .instruction(args);

    let tx = Transaction::new_signed_with_payer(
        &[ix],
        Some(&context.payer.pubkey()),
        &[&context.payer, &payer],
        context.last_blockhash,
    );

    context.banks_client.process_transaction(tx).await.unwrap();

    let mint_proof_data: MintProofV2 = fetch(&mint_proof, &mut context).await.unwrap();

    assert!(mint_proof_data.creation_slot >= 100);
    assert_eq!(mint_proof_data.payer, payer.pubkey());

    // Proof on-chain is padded to 28 * 32 bytes.
    assert_eq!(&mint_proof_data.proof[0..proof.len()], proof.as_slice());

    // Proof length is on-chain is without the padding.
    assert_eq!(mint_proof_data.proof_len, proof.len() as u8);

    let payer_balance_before = context
        .banks_client
        .get_balance(payer.pubkey())
        .await
        .unwrap();

    // Close the mint proof within the 100 slot grace period for the payer to get the rent back.
    let ix = CloseMintProofV2 {
        payer: payer.pubkey(),
        signer: payer.pubkey(),
        mint_proof,
        system_program: solana_program::system_program::ID,
    }
    .instruction();

    let tx = Transaction::new_signed_with_payer(
        &[ix],
        Some(&context.payer.pubkey()),
        &[&context.payer, &payer],
        context.last_blockhash,
    );

    context.banks_client.process_transaction(tx).await.unwrap();

    // Mint proof should be closed.
    let err = fetch::<MintProofV2>(&mint_proof, &mut context)
        .await
        .unwrap_err();

    assert_eq!(err.to_string(), "client error: Account not found");

    let payer_balance_after = context
        .banks_client
        .get_balance(payer.pubkey())
        .await
        .unwrap();

    let rent = context.banks_client.get_rent().await.unwrap();

    let mint_proof_v2_rent = rent.minimum_balance(945);

    assert!((payer_balance_after - payer_balance_before) == mint_proof_v2_rent);
}

#[tokio::test]
async fn closing_refunds_signer_after_100_slots() {
    let mut context = program_context().await;

    let payer = Keypair::new();
    let signer = Keypair::new();
    let update_authority = Keypair::new();

    airdrop(&mut context, &payer.pubkey(), ONE_SOL_LAMPORTS)
        .await
        .unwrap();
    airdrop(&mut context, &update_authority.pubkey(), ONE_SOL_LAMPORTS)
        .await
        .unwrap();

    // Mint an NFT.
    let inputs = TestMintMetaplexNftInputs {
        payer: Some(payer.dirty_clone()),
        update_authority: update_authority.dirty_clone(),
        owner: None, // defaults to update authority
    };
    let nft = mint_metaplex_nft(&mut context, inputs).await;

    let leaf = hash(nft.mint.as_ref());
    let mut leaves = vec![leaf.0];

    leaves.push(hash(&EMPTY).0);
    leaves.sort();

    let index = leaves.iter().position(|x| x == &leaf.0).unwrap();

    // Simple Merkle tree.
    let tree = MerkleTree::new(&leaves);

    // Get the root proof.
    let root = tree.get_root();

    // Get the proof for the leaf.
    let proof = tree.get_proof_of_leaf(index);

    let conditions = vec![Condition {
        mode: Mode::MerkleTree,
        value: Pubkey::new_from_array(root), // pubkey type on-chain for convenience
    }];

    // Create a whitelist with the merkle tree as a condition.
    let inputs = TestWhitelistV2Inputs {
        update_authority: update_authority.dirty_clone(),
        conditions: Some(conditions.clone()),
        ..TestWhitelistV2Inputs::default()
    };
    let test_whitelist = setup_default_whitelist_v2(&mut context, inputs).await;

    let whitelist_data: WhitelistV2 = fetch(&test_whitelist.whitelist, &mut context)
        .await
        .unwrap();

    assert_eq!(whitelist_data.conditions.len(), conditions.len());
    assert_eq!(whitelist_data.uuid, test_whitelist.uuid);
    assert_eq!(whitelist_data.namespace, test_whitelist.namespace);
    assert_eq!(whitelist_data.update_authority, update_authority.pubkey());

    // Warp 100 slots so we can check the created at slot.
    context.warp_to_slot(100).unwrap();

    let args = InitUpdateMintProofV2InstructionArgs {
        proof: proof.clone(),
    };

    let mint_proof = MintProofV2::find_pda(&nft.mint, &test_whitelist.whitelist).0;

    let ix = InitUpdateMintProofV2 {
        whitelist: test_whitelist.whitelist,
        payer: payer.pubkey(), // Payer is stored on MintProofV2 account
        mint: nft.mint,
        mint_proof,
        system_program: solana_program::system_program::ID,
    }
    .instruction(args);

    let tx = Transaction::new_signed_with_payer(
        &[ix],
        Some(&context.payer.pubkey()),
        &[&context.payer, &payer],
        context.last_blockhash,
    );

    context.banks_client.process_transaction(tx).await.unwrap();

    let mint_proof_data: MintProofV2 = fetch(&mint_proof, &mut context).await.unwrap();

    assert!(mint_proof_data.creation_slot >= 100);
    assert_eq!(mint_proof_data.payer, payer.pubkey());

    // Proof on-chain is padded to 28 * 32 bytes.
    assert_eq!(&mint_proof_data.proof[0..proof.len()], proof.as_slice());

    // Proof length is on-chain is without the padding.
    assert_eq!(mint_proof_data.proof_len, proof.len() as u8);

    // Warp past grace period slot so we can check the funds get refunded to signer
    // instead of the original payer.
    context.warp_to_slot(201).unwrap();

    // Signer should have 0 balance prior to closing the account.
    let signer_balance = context
        .banks_client
        .get_balance(signer.pubkey())
        .await
        .unwrap();

    assert!(signer_balance == 0);

    let ix = CloseMintProofV2 {
        payer: payer.pubkey(),   // original payer
        signer: signer.pubkey(), // can be anyone who wishes to reclaim the rent after creation time + slot 100
        mint_proof,
        system_program: solana_program::system_program::ID,
    }
    .instruction();

    let tx = Transaction::new_signed_with_payer(
        &[ix],
        Some(&context.payer.pubkey()),
        &[&context.payer, &signer],
        context.last_blockhash,
    );

    context.banks_client.process_transaction(tx).await.unwrap();

    // Mint proof should be closed.
    let err = fetch::<MintProofV2>(&mint_proof, &mut context)
        .await
        .unwrap_err();

    assert_eq!(err.to_string(), "client error: Account not found");

    let signer_balance = context
        .banks_client
        .get_balance(signer.pubkey())
        .await
        .unwrap();

    let rent = context.banks_client.get_rent().await.unwrap();

    let mint_proof_v2_rent = rent.minimum_balance(945);

    assert!(signer_balance == mint_proof_v2_rent);
}
