#![cfg(feature = "test-sbf")]
pub mod setup;

use solana_program_test::tokio;
use solana_sdk::{
    keccak::hash, pubkey::Pubkey, signature::Keypair, signer::Signer, transaction::Transaction,
};
use spl_merkle_tree_reference::{MerkleTree, EMPTY};
use tensor_whitelist::{
    accounts::{MintProofV2, WhitelistV2},
    instructions::{CloseMintProofV2, CreateMintProofV2, CreateMintProofV2InstructionArgs},
    types::{Condition, Mode},
};

use crate::setup::{
    airdrop, fetch, mint_metaplex_nft, program_context, setup_default_whitelist_v2, DirtyClone,
    TestMintMetaplexNftInputs, TestWhitelistV2Inputs, ONE_SOL_LAMPORTS,
};

#[tokio::test]
async fn create_and_close_mint_proof_v2() {
    let mut context = program_context().await;
    let update_authority = Keypair::new();
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

    // Simple Merkle tree.
    let mut tree = MerkleTree::new(vec![EMPTY; 4].as_slice());

    // Add the mint to the tree. The verify function assumes sorting so we need
    // to add the leaf to the right of any empty nodes. (E.g. index 1,3,5...)
    tree.add_leaf(leaf.0, 1);

    // Get the root proof.
    let root = tree.get_root();

    // Get the proof for the leaf.
    let proof = tree.get_proof_of_leaf(1);

    assert!(validate_proof(&root, &leaf.0, &proof));

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

    let whitelist_data: WhitelistV2 = fetch(&test_whitelist.whitelist, &mut context).await;

    assert_eq!(whitelist_data.conditions.len(), conditions.len());
    assert_eq!(whitelist_data.uuid, test_whitelist.uuid);
    assert_eq!(whitelist_data.namespace, test_whitelist.namespace);
    assert_eq!(whitelist_data.update_authority, update_authority.pubkey());

    // Warp 100 slots so we can check the created at slot.
    context.warp_to_slot(100).unwrap();

    let args = CreateMintProofV2InstructionArgs {
        proof: proof.clone(),
    };

    let mint_proof = MintProofV2::find_pda(&nft.mint, &test_whitelist.whitelist).0;

    let ix = CreateMintProofV2 {
        whitelist: test_whitelist.whitelist,
        payer: update_authority.pubkey(),
        mint: nft.mint,
        mint_proof,
        system_program: solana_program::system_program::ID,
    }
    .instruction(args);

    let tx = Transaction::new_signed_with_payer(
        &[ix],
        Some(&context.payer.pubkey()),
        &[&context.payer, &update_authority],
        context.last_blockhash,
    );

    context.banks_client.process_transaction(tx).await.unwrap();

    let mint_proof_data: MintProofV2 = fetch(&mint_proof, &mut context).await;

    assert!(mint_proof_data.creation_slot >= 100);
    assert_eq!(mint_proof_data.payer, update_authority.pubkey());

    // Proof on-chain is padded to 28 * 32 bytes.
    assert_eq!(&mint_proof_data.proof[0..proof.len()], proof.as_slice());

    // Proof length is on-chain is without the padding.
    assert_eq!(mint_proof_data.proof_len, proof.len() as u8);

    // Close the mint proof within the 100 slot grace period for the payer to get the rent back.
    let ix = CloseMintProofV2 {
        payer: update_authority.pubkey(),
        signer: update_authority.pubkey(),
        mint_proof,
        system_program: solana_program::system_program::ID,
    }
    .instruction();

    let tx = Transaction::new_signed_with_payer(
        &[ix],
        Some(&context.payer.pubkey()),
        &[&context.payer, &update_authority],
        context.last_blockhash,
    );

    context.banks_client.process_transaction(tx).await.unwrap();
}

use solana_program::keccak::hashv;

pub fn validate_proof(root: &[u8; 32], leaf: &[u8; 32], proof: &[[u8; 32]]) -> bool {
    let mut path = *leaf;
    proof.iter().for_each(|sibling| {
        path = if path < *sibling {
            hashv(&[&path, sibling]).0
        } else {
            hashv(&[sibling, &path]).0
        };
    });

    path == *root
}
