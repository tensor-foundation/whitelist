import {
  SOLANA_ERROR__JSON_RPC__INVALID_PARAMS,
  appendTransactionMessageInstruction,
  generateKeyPairSigner,
  isSolanaError,
  pipe,
} from '@solana/web3.js';
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
  fetchMintProofV2,
  findMintProofV2Pda,
  getInitUpdateMintProofV2InstructionAsync,
  intoAddress,
} from '../src';
import {
  createMintProofThrows,
  createWhitelist,
  upsertMintProof,
} from './_common';
import { generateTreeOfSize } from './_merkle';

const MAX_PROOF_LENGTH = 28;

test('it can create and update mint proof v2', async (t) => {
  const client = createDefaultSolanaClient();

  const updateAuthority = await generateKeyPairSignerWithSol(client);
  const freezeAuthority = (await generateKeyPairSigner()).address;
  const namespace = await generateKeyPairSigner();

  const nftOwner = await generateKeyPairSignerWithSol(client);

  // Mint NFT
  const { mint } = await createDefaultNft(client, nftOwner, nftOwner, nftOwner);

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
  const { mint: mint2 } = await createDefaultNft(
    client,
    nftOwner,
    nftOwner,
    nftOwner
  );

  // Setup a new merkle tree with both mints as leaves.
  const {
    root: root2,
    proofs: [p2],
  } = await generateTreeOfSize(10, [mint, mint2]);

  const conditions2: Condition[] = [
    { mode: Mode.MerkleTree, value: intoAddress(root2) },
  ];

  // Create a new whitelist with both mints.
  const { whitelist: whitelist2 } = await createWhitelist({
    client,
    updateAuthority,
    freezeAuthority,
    conditions: conditions2,
    namespace,
  });

  // Update the mint proof with the new proof.
  const { mintProof: mintProof2 } = await upsertMintProof({
    client,
    payer: nftOwner,
    mint,
    whitelist: whitelist2,
    proof: p2.proof,
  });

  // Check it was updated.
  t.like(await fetchMintProofV2(client.rpc, mintProof2), <MintProofV2>(<
    unknown
  >{
    address: mintProof2,
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
  const { mint } = await createDefaultNft(client, nftOwner, nftOwner, nftOwner);

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

  await upsertMintProof({
    client,
    payer: newPayer,
    mint,
    whitelist,
    proof: p.proof,
  });

  // Payer should be the original payer.
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
  const { mint } = await createDefaultNft(client, nftOwner, nftOwner, nftOwner);

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
    code: 6008n, // FailedMerkleProofVerification
  });
});

test('too long proof fails', async (t) => {
  const client = createDefaultSolanaClient();

  const updateAuthority = await generateKeyPairSignerWithSol(client);
  const freezeAuthority = (await generateKeyPairSigner()).address;
  const namespace = await generateKeyPairSigner();

  const nftOwner = await generateKeyPairSignerWithSol(client);

  // Mint NFT
  const { mint } = await createDefaultNft(client, nftOwner, nftOwner, nftOwner);

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
  const { mint } = await createDefaultNft(client, nftOwner, nftOwner, nftOwner);

  // Setup a merkle tree with our mint as a leaf∏
  const {
    root,
    proofs: [p],
  } = await generateTreeOfSize(10, [mint]);

  // Use the real root, but FVC instead of MerkleTree.
  const conditions: Condition[] = [
    { mode: Mode.FVC, value: intoAddress(root) },
  ];

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
    code: 6011n, // NotMerkleRoot
  });
});
