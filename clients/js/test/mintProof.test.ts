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
  getCreateMintProofV2Instruction,
  intoAddress,
} from '../src';
import {
  createMintProof,
  createMintProofThrows,
  createWhitelist,
} from './_common';
import { generateTreeOfSize } from './_merkle';

const MAX_PROOF_LENGTH = 28;

test('it can create a mint proof v2', async (t) => {
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

  const { mintProof } = await createMintProof({
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

  const createMintProofIx = getCreateMintProofV2Instruction({
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
