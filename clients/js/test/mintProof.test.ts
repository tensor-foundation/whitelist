import {
  SOLANA_ERROR__JSON_RPC__INVALID_PARAMS,
  appendTransactionMessageInstruction,
  generateKeyPairSigner,
  isSolanaError,
  pipe,
} from '@solana/web3.js';
import { createDefaultAsset } from '@tensor-foundation/mpl-core';
import { createDefaultNft } from '@tensor-foundation/mpl-token-metadata';
import {
  createDefaultSolanaClient,
  createDefaultTransaction,
  generateKeyPairSignerWithSol,
  signAndSendTransaction,
} from '@tensor-foundation/test-helpers';
import test from 'ava';
import {
  Condition,
  MintProofV2,
  Mode,
  TENSOR_WHITELIST_ERROR__FAILED_MERKLE_PROOF_VERIFICATION,
  TENSOR_WHITELIST_ERROR__INVALID_AUTHORITY,
  TENSOR_WHITELIST_ERROR__NOT_MERKLE_ROOT,
  fetchMaybeMintProofV2,
  fetchMintProofV2,
  findMintProofV2Pda,
  getCloseMintProofV2Instruction,
  getInitUpdateMintProofV2InstructionAsync,
  intoAddress,
} from '../src';
import {
  MAX_PROOF_LENGTH,
  SLOT_DELAY,
  TRANSACTION_FEE,
  createMintProofThrows,
  createWhitelist,
  expectCustomError,
  updateWhitelist,
  upsertMintProof,
} from './_common';
import { generateTreeOfSize } from './_merkle';
import {
  ANCHOR_ERROR__ACCOUNT_DISCRIMINATOR_MISMATCH,
  ANCHOR_ERROR__ACCOUNT_NOT_INITIALIZED,
} from '@coral-xyz/anchor-errors';

test('it can create and update mint proof v2', async (t) => {
  const client = createDefaultSolanaClient();

  const updateAuthority = await generateKeyPairSignerWithSol(client);
  const freezeAuthority = (await generateKeyPairSigner()).address;
  const namespace = await generateKeyPairSigner();

  const nftOwner = await generateKeyPairSignerWithSol(client);

  // Mint NFT
  const { mint } = await createDefaultNft({
    client,
    payer: nftOwner,
    owner: nftOwner.address,
    authority: nftOwner,
  });

  // Setup a merkle tree with our mint as a leaf
  const {
    root,
    proofs: [p],
  } = await generateTreeOfSize(10, [mint]);

  const conditions: Condition[] = [
    { mode: Mode.MerkleTree, value: intoAddress(root) },
  ];

  const { whitelist } = await createWhitelist({
    client,
    updateAuthority,
    freezeAuthority,
    conditions,
    namespace,
  });

  const { mintProof } = await upsertMintProof({
    client,
    payer: nftOwner,
    mint,
    whitelist,
    proof: p.proof,
  });

  t.like(await fetchMintProofV2(client.rpc, mintProof), <MintProofV2>(<unknown>{
    address: mintProof,
    data: {
      proof: p.proof,
      payer: nftOwner.address,
    },
  }));

  // Mint a second NFT
  const { mint: mint2 } = await createDefaultNft({
    client,
    payer: nftOwner,
    authority: nftOwner,
    owner: nftOwner.address,
  });

  // Setup a new merkle tree with both mints as leaves.
  const {
    root: root2,
    proofs: [p2],
  } = await generateTreeOfSize(10, [mint, mint2]);

  const conditions2: Condition[] = [
    { mode: Mode.MerkleTree, value: intoAddress(root2) },
  ];

  // Update the whitelist with the new conditions.
  await updateWhitelist({
    client,
    updateAuthority,
    newConditions: conditions2,
    whitelist,
  });

  // Update the mint proof with the new proof.
  await upsertMintProof({
    client,
    payer: nftOwner,
    mint,
    whitelist,
    proof: p2.proof,
  });

  // Check it was updated.
  t.like(await fetchMintProofV2(client.rpc, mintProof), <MintProofV2>(<unknown>{
    address: mintProof,
    data: {
      proof: p2.proof,
      payer: nftOwner.address,
    },
  }));
});

test('it can create and update mint proof v2 for a non-mint NFT', async (t) => {
  // Mint proofs can be created for asset-based NFTs without Mint accounts.
  const client = createDefaultSolanaClient();

  const updateAuthority = await generateKeyPairSignerWithSol(client);
  const freezeAuthority = (await generateKeyPairSigner()).address;
  const namespace = await generateKeyPairSigner();

  const nftOwner = await generateKeyPairSignerWithSol(client);

  // Mint Core asset
  const asset = await createDefaultAsset({
    client,
    payer: nftOwner,
    owner: nftOwner.address,
    authority: nftOwner,
  });

  // Setup a merkle tree with our asset as a leaf
  const {
    root,
    proofs: [p],
  } = await generateTreeOfSize(10, [asset.address]);

  const conditions: Condition[] = [
    { mode: Mode.MerkleTree, value: intoAddress(root) },
  ];

  const { whitelist } = await createWhitelist({
    client,
    updateAuthority,
    freezeAuthority,
    conditions,
    namespace,
  });

  const { mintProof } = await upsertMintProof({
    client,
    payer: nftOwner,
    mint: asset.address,
    whitelist,
    proof: p.proof,
  });

  t.like(await fetchMintProofV2(client.rpc, mintProof), <MintProofV2>(<unknown>{
    address: mintProof,
    data: {
      proof: p.proof,
      payer: nftOwner.address,
    },
  }));

  // Mint a second asset
  const asset2 = await createDefaultAsset({
    client,
    payer: nftOwner,
    owner: nftOwner.address,
    authority: nftOwner,
  });

  // Setup a new merkle tree with both mints as leaves.
  const {
    root: root2,
    proofs: [p2],
  } = await generateTreeOfSize(10, [asset.address, asset2.address]);

  const conditions2: Condition[] = [
    { mode: Mode.MerkleTree, value: intoAddress(root2) },
  ];

  // Update the whitelist with the new conditions.
  await updateWhitelist({
    client,
    updateAuthority,
    newConditions: conditions2,
    whitelist,
  });

  // Update the mint proof with the new proof.
  await upsertMintProof({
    client,
    payer: nftOwner,
    mint: asset.address,
    whitelist,
    proof: p2.proof,
  });

  // Check it was updated.
  t.like(await fetchMintProofV2(client.rpc, mintProof), <MintProofV2>(<unknown>{
    address: mintProof,
    data: {
      proof: p2.proof,
      payer: nftOwner.address,
    },
  }));
});

test('it cannot override the stored payer', async (t) => {
  const client = createDefaultSolanaClient();

  const updateAuthority = await generateKeyPairSignerWithSol(client);
  const freezeAuthority = (await generateKeyPairSigner()).address;
  const namespace = await generateKeyPairSigner();

  const nftOwner = await generateKeyPairSignerWithSol(client);

  // Mint NFT
  const { mint } = await createDefaultNft({
    client,
    payer: nftOwner,
    authority: nftOwner,
    owner: nftOwner.address,
  });

  // Setup a merkle tree with our mint as a leaf
  const {
    root,
    proofs: [p],
  } = await generateTreeOfSize(10, [mint]);

  const conditions: Condition[] = [
    { mode: Mode.MerkleTree, value: intoAddress(root) },
  ];

  const { whitelist } = await createWhitelist({
    client,
    updateAuthority,
    freezeAuthority,
    conditions,
    namespace,
  });

  const { mintProof } = await upsertMintProof({
    client,
    payer: nftOwner,
    mint,
    whitelist,
    proof: p.proof,
  });

  t.like(await fetchMintProofV2(client.rpc, mintProof), <MintProofV2>(<unknown>{
    address: mintProof,
    data: {
      proof: p.proof,
      payer: nftOwner.address,
    },
  }));

  // Try to update the payer.
  const newPayer = await generateKeyPairSignerWithSol(client);

  // This succeeds...
  await upsertMintProof({
    client,
    payer: newPayer,
    mint,
    whitelist,
    proof: p.proof,
  });

  // ...but the payer should be the original payer.
  t.like(await fetchMintProofV2(client.rpc, mintProof), <MintProofV2>(<unknown>{
    address: mintProof,
    data: {
      proof: p.proof,
      payer: nftOwner.address, // original payer
    },
  }));
});

test('invalid proof fails', async (t) => {
  const client = createDefaultSolanaClient();

  const updateAuthority = await generateKeyPairSignerWithSol(client);
  const freezeAuthority = (await generateKeyPairSigner()).address;
  const namespace = await generateKeyPairSigner();

  const nftOwner = await generateKeyPairSignerWithSol(client);

  // Mint NFT
  const { mint } = await createDefaultNft({
    client,
    payer: nftOwner,
    authority: nftOwner,
    owner: nftOwner.address,
  });

  // Setup a merkle tree with our mint as a leaf
  const { root } = await generateTreeOfSize(10, [mint]);

  // Use the real root.
  const conditions: Condition[] = [
    { mode: Mode.MerkleTree, value: intoAddress(root) },
  ];

  const { whitelist } = await createWhitelist({
    client,
    updateAuthority,
    freezeAuthority,
    conditions,
    namespace,
  });

  // Use a bad proof.
  await createMintProofThrows({
    client,
    payer: nftOwner,
    mint,
    whitelist,
    proof: [
      Uint8Array.from({ length: 32 }, () => Math.floor(Math.random() * 256)),
    ],
    t,
    code: TENSOR_WHITELIST_ERROR__FAILED_MERKLE_PROOF_VERIFICATION,
  });
});

test('too long proof fails', async (t) => {
  const client = createDefaultSolanaClient();

  const updateAuthority = await generateKeyPairSignerWithSol(client);
  const freezeAuthority = (await generateKeyPairSigner()).address;
  const namespace = await generateKeyPairSigner();

  const nftOwner = await generateKeyPairSignerWithSol(client);

  // Mint NFT
  const { mint } = await createDefaultNft({
    client,
    payer: nftOwner,
    authority: nftOwner,
    owner: nftOwner.address,
  });

  // Setup a merkle tree with our mint as a leaf
  const { root } = await generateTreeOfSize(10, [mint]);

  // Use the real root.
  const conditions: Condition[] = [
    { mode: Mode.MerkleTree, value: intoAddress(root) },
  ];

  const { whitelist } = await createWhitelist({
    client,
    updateAuthority,
    freezeAuthority,
    conditions,
    namespace,
  });

  const proof = Array(MAX_PROOF_LENGTH + 1).fill(
    Uint8Array.from({ length: 32 }, () => Math.floor(Math.random() * 256))
  );

  const [mintProof] = await findMintProofV2Pda({ mint, whitelist });

  const createMintProofIx = await getInitUpdateMintProofV2InstructionAsync({
    payer: nftOwner,
    mint,
    mintProof,
    whitelist,
    proof,
  });

  const promise = pipe(
    await createDefaultTransaction(client, nftOwner),
    (tx) => appendTransactionMessageInstruction(createMintProofIx, tx),
    (tx) => signAndSendTransaction(client, tx, { skipPreflight: true })
  );

  const error = await t.throwsAsync<Error & { data: { logs: string[] } }>(
    promise
  );

  if (isSolanaError(error, SOLANA_ERROR__JSON_RPC__INVALID_PARAMS)) {
    t.assert(
      error.context.__serverMessage.includes('VersionedTransaction too large')
    );
  } else {
    t.fail('expected a specific error, but received: ' + error);
  }
});

test('invalid condition fails', async (t) => {
  const client = createDefaultSolanaClient();

  const updateAuthority = await generateKeyPairSignerWithSol(client);
  const freezeAuthority = (await generateKeyPairSigner()).address;
  const namespace = await generateKeyPairSigner();

  const nftOwner = await generateKeyPairSignerWithSol(client);

  // Mint NFT
  const { mint } = await createDefaultNft({
    client,
    payer: nftOwner,
    authority: nftOwner,
    owner: nftOwner.address,
  });

  // Setup a merkle tree with our mint as a leaf
  const {
    root,
    proofs: [p],
  } = await generateTreeOfSize(10, [mint]);

  // Use the real root, but FVC instead of MerkleTree.
  let conditions: Condition[] = [{ mode: Mode.FVC, value: intoAddress(root) }];

  const { whitelist } = await createWhitelist({
    client,
    updateAuthority,
    freezeAuthority,
    conditions,
    namespace,
  });

  await createMintProofThrows({
    client,
    payer: nftOwner,
    mint,
    whitelist,
    proof: p.proof, // real proof
    t,
    code: TENSOR_WHITELIST_ERROR__NOT_MERKLE_ROOT, // condition is not merkle root type
  });

  // For good measure, let's try a VOC condition.
  conditions = [{ mode: Mode.VOC, value: intoAddress(root) }];

  await updateWhitelist({
    client,
    updateAuthority,
    newConditions: conditions,
    whitelist,
  });

  await createMintProofThrows({
    client,
    payer: nftOwner,
    mint,
    whitelist,
    proof: p.proof, // real proof
    t,
    code: TENSOR_WHITELIST_ERROR__NOT_MERKLE_ROOT, // condition is not merkle root type
  });
});

test('invalid whitelist fails', async (t) => {
  const client = createDefaultSolanaClient();

  const updateAuthority = await generateKeyPairSignerWithSol(client);
  const freezeAuthority = (await generateKeyPairSigner()).address;
  const namespace = await generateKeyPairSigner();

  const nftOwner = await generateKeyPairSignerWithSol(client);

  // Mint NFT
  const { mint } = await createDefaultNft({
    client,
    payer: nftOwner,
    authority: nftOwner,
    owner: nftOwner.address,
  });

  // Setup a merkle tree with our mint as a leaf
  const {
    root,
    proofs: [p],
  } = await generateTreeOfSize(10, [mint]);

  const conditions: Condition[] = [
    { mode: Mode.MerkleTree, value: intoAddress(root) },
  ];

  const { whitelist } = await createWhitelist({
    client,
    updateAuthority,
    freezeAuthority,
    conditions,
    namespace,
  });

  // Succeeds
  const { mintProof } = await upsertMintProof({
    client,
    payer: nftOwner,
    mint,
    whitelist,
    proof: p.proof,
  });

  await createMintProofThrows({
    client,
    payer: nftOwner,
    mint,
    whitelist: mintProof, // Wrong account type
    proof: p.proof,
    t,
    code: ANCHOR_ERROR__ACCOUNT_DISCRIMINATOR_MISMATCH,
  });

  await createMintProofThrows({
    client,
    payer: nftOwner,
    mint,
    whitelist: (await generateKeyPairSigner()).address, // Not initialized
    proof: p.proof,
    t,
    code: ANCHOR_ERROR__ACCOUNT_NOT_INITIALIZED,
  });
});

test('cannot close the mint proof account before slot delay if not original signer', async (t) => {
  const client = createDefaultSolanaClient();

  const updateAuthority = await generateKeyPairSignerWithSol(client);
  const mintProofSigner = await generateKeyPairSignerWithSol(client);
  const notMintProofSigner = await generateKeyPairSignerWithSol(client);

  const { mint } = await createDefaultNft({
    client,
    payer: mintProofSigner,
    authority: mintProofSigner,
    owner: mintProofSigner.address,
  });

  const {
    root,
    proofs: [p],
  } = await generateTreeOfSize(10, [mint]);

  const conditions: Condition[] = [
    { mode: Mode.MerkleTree, value: intoAddress(root) },
  ];

  const { whitelist } = await createWhitelist({
    client,
    updateAuthority,
    conditions,
  });

  const [mintProof] = await findMintProofV2Pda({ mint, whitelist });

  const createMintProofIx = await getInitUpdateMintProofV2InstructionAsync({
    payer: mintProofSigner,
    mint,
    mintProof,
    whitelist,
    proof: p.proof,
  });

  await pipe(
    await createDefaultTransaction(client, mintProofSigner),
    (tx) => appendTransactionMessageInstruction(createMintProofIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  const creationSlot = (await fetchMintProofV2(client.rpc, mintProof)).data.creationSlot;

  // If not original signer => Can't close it with own address as payer... 
  const closeMintProofIxWrongAddress = getCloseMintProofV2Instruction({
    payer: mintProofSigner.address,
    mintProof,
    signer: notMintProofSigner,
  });

  const promise = pipe(
    await createDefaultTransaction(client, notMintProofSigner),
    (tx) => appendTransactionMessageInstruction(closeMintProofIxWrongAddress, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  await expectCustomError(t, promise, TENSOR_WHITELIST_ERROR__INVALID_AUTHORITY);

  // Mint proof is still open and unchanged
  let mintProofAcc = await fetchMintProofV2(client.rpc, mintProof);
  t.like(mintProofAcc.data, {
    proof: p.proof,
    creationSlot,
    proofLen: p.proof.length,
    payer: mintProofSigner.address,
  });

  // ... and also not with the correct address as payer (DOS attack vector)
  const closeMintProofIxNotAllowed = getCloseMintProofV2Instruction({
    payer: mintProofSigner.address,
    mintProof,
    signer: notMintProofSigner,
  });

  const promiseV2 = pipe(
    await createDefaultTransaction(client, mintProofSigner),
    (tx) => appendTransactionMessageInstruction(closeMintProofIxNotAllowed, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  await expectCustomError(t, promiseV2, TENSOR_WHITELIST_ERROR__INVALID_AUTHORITY);

  // Mint proof is still open and unchanged
  mintProofAcc = await fetchMintProofV2(client.rpc, mintProof);
  t.like(mintProofAcc.data, {
    proof: p.proof,
    creationSlot,
    proofLen: p.proof.length,
    payer: mintProofSigner.address,
  });

  // Assert that the test ran WITHIN expected slot delay
  const currentSlot = await client.rpc.getSlot().send();
  t.assert(currentSlot - creationSlot < SLOT_DELAY);
});

test('mint proof can be closed by original signer before slot delay - receives rent back', async (t) => {
  const client = createDefaultSolanaClient();

  const mintProofSigner = await generateKeyPairSignerWithSol(client); 
  const updateAuthority = await generateKeyPairSignerWithSol(client);
  const { mint } = await createDefaultNft({
    client,
    payer: mintProofSigner,
    authority: mintProofSigner,
    owner: mintProofSigner.address,
  });

  const {
    root,
    proofs: [p],
  } = await generateTreeOfSize(10, [mint]);

  const conditions: Condition[] = [
    { mode: Mode.MerkleTree, value: intoAddress(root) },
  ];

  const { whitelist } = await createWhitelist({
    client,
    updateAuthority,
    conditions,
  });

  const [mintProof] = await findMintProofV2Pda({ mint, whitelist });

  const beforeFunds = (await client.rpc.getBalance(mintProofSigner.address).send()).value;

  const createMintProofIx = await getInitUpdateMintProofV2InstructionAsync({
    payer: mintProofSigner,
    mint,
    mintProof,
    whitelist,
    proof: p.proof,
  });

  await pipe(
    await createDefaultTransaction(client, mintProofSigner),
    (tx) => appendTransactionMessageInstruction(createMintProofIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );
  const creationSlot = (await fetchMintProofV2(client.rpc, mintProof)).data.creationSlot;

  const closeMintProofIxOriginalSigner = getCloseMintProofV2Instruction({
    payer: mintProofSigner.address,
    mintProof,
    signer: mintProofSigner,
  }); 

  await pipe(
    await createDefaultTransaction(client, mintProofSigner),
    (tx) => appendTransactionMessageInstruction(closeMintProofIxOriginalSigner, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  const afterFunds = (await client.rpc.getBalance(mintProofSigner.address).send()).value;

  // Mint proof is closed now...
  t.assert((await fetchMaybeMintProofV2(client.rpc, mintProof)).exists === false);
  // ... the original signer received rent back ...
  t.assert(afterFunds === beforeFunds - (TRANSACTION_FEE * 2n)); // Creation + Closing tx fees subtracted
  // ... within the slot delay
  const currentSlot = await client.rpc.getSlot().send();
  t.assert(currentSlot - creationSlot < SLOT_DELAY);
});
