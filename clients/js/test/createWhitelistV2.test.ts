import test from 'ava';
import { generateKeyPairSigner } from '@solana/signers';
import {
  createDefaultSolanaClient,
  generateKeyPairSignerWithSol,
} from './_setup';
import { Condition, Mode, WhitelistV2, fetchWhitelistV2 } from '../src';
import {
  DEFAULT_PUBKEY,
  createWhitelist,
  createWhitelistThrows,
} from './_common';

test('it can create a whitelist v2', async (t) => {
  const client = createDefaultSolanaClient();
  const updateAuthority = await generateKeyPairSignerWithSol(client);
  const freezeAuthority = (await generateKeyPairSigner()).address;
  const namespace = await generateKeyPairSigner();
  const voc = (await generateKeyPairSigner()).address;

  const conditions = [
    { mode: Mode.FVC, value: updateAuthority.address },
    { mode: Mode.VOC, value: voc },
  ];

  const { whitelist, uuid } = await createWhitelist({
    client,
    updateAuthority,
    freezeAuthority,
    conditions,
    namespace,
  });

  // Then a whitelist authority was created with the correct data.
  t.like(await fetchWhitelistV2(client.rpc, whitelist), <WhitelistV2>{
    address: whitelist,
    data: {
      updateAuthority: updateAuthority.address,
      namespace: namespace.address,
      freezeAuthority,
      uuid,
      conditions,
    },
  });
});

test('creating a whitelist v2 with no freeze authority defaults to system pubkey', async (t) => {
  const client = createDefaultSolanaClient();
  const updateAuthority = await generateKeyPairSignerWithSol(client);
  const namespace = await generateKeyPairSigner();
  const voc = (await generateKeyPairSigner()).address;

  const conditions = [
    { mode: Mode.FVC, value: updateAuthority.address },
    { mode: Mode.VOC, value: voc },
  ];

  const { whitelist, uuid } = await createWhitelist({
    client,
    updateAuthority,
    conditions,
    namespace,
  });

  // Then a whitelist authority was created with the correct data.
  t.like(await fetchWhitelistV2(client.rpc, whitelist), <WhitelistV2>{
    address: whitelist,
    data: {
      updateAuthority: updateAuthority.address,
      namespace: namespace.address,
      freezeAuthority: DEFAULT_PUBKEY,
      uuid,
      conditions,
    },
  });
});

test('it can create a whitelist v2 with an empty conditions list', async (t) => {
  const client = createDefaultSolanaClient();
  const updateAuthority = await generateKeyPairSignerWithSol(client);

  const conditions: Condition[] = [];

  const { whitelist, uuid } = await createWhitelist({
    client,
    updateAuthority,
    conditions,
  });

  // Then a whitelist updateAuthority was created with the correct data.
  t.like(await fetchWhitelistV2(client.rpc, whitelist), <WhitelistV2>{
    address: whitelist,
    data: {
      updateAuthority: updateAuthority.address,
      uuid,
      conditions,
    },
  });
});

test('it can create a whitelist v2 funded by a separate payer', async (t) => {
  const client = createDefaultSolanaClient();
  const payer = await generateKeyPairSignerWithSol(client);
  // No funds, so can't pay.
  const updateAuthority = await generateKeyPairSigner();
  const freezeAuthority = (await generateKeyPairSigner()).address;
  const namespace = await generateKeyPairSigner();
  const voc = (await generateKeyPairSigner()).address;

  const conditions = [
    { mode: Mode.FVC, value: updateAuthority.address },
    { mode: Mode.VOC, value: voc },
  ];

  const { whitelist, uuid } = await createWhitelist({
    client,
    payer,
    updateAuthority,
    freezeAuthority,
    conditions,
    namespace,
  });

  // Then a whitelist authority was created with the correct data.
  t.like(await fetchWhitelistV2(client.rpc, whitelist), <WhitelistV2>{
    address: whitelist,
    data: {
      updateAuthority: updateAuthority.address,
      namespace: namespace.address,
      freezeAuthority,
      uuid,
      conditions,
    },
  });
});

test('it cannot create a whitelist v2 with more than one merkle proof', async (t) => {
  const client = createDefaultSolanaClient();
  const updateAuthority = await generateKeyPairSignerWithSol(client);
  const freezeAuthority = (await generateKeyPairSigner()).address;
  const namespace = await generateKeyPairSigner();
  const merkleProof1 = (await generateKeyPairSigner()).address;
  const merkleProof2 = (await generateKeyPairSigner()).address;

  const conditions = [
    { mode: Mode.FVC, value: updateAuthority.address },
    { mode: Mode.MerkleTree, value: merkleProof1 },
    { mode: Mode.MerkleTree, value: merkleProof2 },
  ];

  await createWhitelistThrows({
    client,
    updateAuthority,
    freezeAuthority,
    conditions,
    namespace,
    t,
    // 6014 -- TooManyMerkleProofs
    message: /custom program error: 0x177e/,
  });
});

test('it moves the merkle proof to the first index for a whitelist v2', async (t) => {
  const client = createDefaultSolanaClient();
  const updateAuthority = await generateKeyPairSignerWithSol(client);
  const freezeAuthority = (await generateKeyPairSigner()).address;
  const namespace = await generateKeyPairSigner();
  const merkleProof1 = (await generateKeyPairSigner()).address;

  // Merkle is last item in the list.
  let conditions = [
    { mode: Mode.FVC, value: updateAuthority.address },
    { mode: Mode.MerkleTree, value: merkleProof1 },
  ];

  let { whitelist, uuid } = await createWhitelist({
    client,
    updateAuthority,
    freezeAuthority,
    conditions,
    namespace,
  });

  let expectedConditions = [
    { mode: Mode.MerkleTree, value: merkleProof1 },
    { mode: Mode.FVC, value: updateAuthority.address },
  ];

  // Then a whitelist authority was created with the correct data.
  t.like(await fetchWhitelistV2(client.rpc, whitelist), <WhitelistV2>{
    address: whitelist,
    data: {
      updateAuthority: updateAuthority.address,
      namespace: namespace.address,
      freezeAuthority,
      uuid,
      conditions: expectedConditions,
    },
  });

  // Merkle is in the middle of the list.
  conditions = [
    { mode: Mode.VOC, value: updateAuthority.address },
    { mode: Mode.VOC, value: updateAuthority.address },
    { mode: Mode.MerkleTree, value: merkleProof1 },
    { mode: Mode.FVC, value: updateAuthority.address },
    { mode: Mode.FVC, value: updateAuthority.address },
  ];

  ({ whitelist, uuid } = await createWhitelist({
    client,
    updateAuthority,
    freezeAuthority,
    conditions,
    namespace,
  }));

  expectedConditions = [
    { mode: Mode.MerkleTree, value: merkleProof1 },
    { mode: Mode.FVC, value: updateAuthority.address },
    { mode: Mode.FVC, value: updateAuthority.address },
    { mode: Mode.VOC, value: updateAuthority.address },
    { mode: Mode.VOC, value: updateAuthority.address },
  ];

  // Then a whitelist authority was created with the correct data.
  t.like(await fetchWhitelistV2(client.rpc, whitelist), <WhitelistV2>{
    address: whitelist,
    data: {
      updateAuthority: updateAuthority.address,
      namespace: namespace.address,
      freezeAuthority,
      uuid,
      conditions: expectedConditions,
    },
  });

  // Merkle is first item in the list.
  conditions = [
    { mode: Mode.MerkleTree, value: merkleProof1 },
    { mode: Mode.VOC, value: updateAuthority.address },
    { mode: Mode.VOC, value: updateAuthority.address },
    { mode: Mode.FVC, value: updateAuthority.address },
    { mode: Mode.FVC, value: updateAuthority.address },
  ];

  ({ whitelist, uuid } = await createWhitelist({
    client,
    updateAuthority,
    freezeAuthority,
    conditions,
    namespace,
  }));

  // Then a whitelist authority was created with the correct data.
  t.like(await fetchWhitelistV2(client.rpc, whitelist), <WhitelistV2>{
    address: whitelist,
    data: {
      updateAuthority: updateAuthority.address,
      namespace: namespace.address,
      freezeAuthority,
      uuid,
      // Should be no change.
      conditions,
    },
  });
});
