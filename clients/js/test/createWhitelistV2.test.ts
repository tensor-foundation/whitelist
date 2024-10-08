import {
  SOLANA_ERROR__JSON_RPC__INVALID_PARAMS,
  appendTransactionMessageInstruction,
  generateKeyPairSigner,
  isSolanaError,
  pipe,
} from '@solana/web3.js';
import {
  createDefaultSolanaClient,
  createDefaultTransaction,
  generateKeyPairSignerWithSol,
  signAndSendTransaction,
} from '@tensor-foundation/test-helpers';
import test from 'ava';
import {
  Condition,
  Mode,
  State,
  TENSOR_WHITELIST_ERROR__EMPTY_CONDITIONS,
  TENSOR_WHITELIST_ERROR__TOO_MANY_MERKLE_PROOFS,
  fetchWhitelistV2,
  findWhitelistV2Pda,
  getCreateWhitelistV2Instruction,
} from '../src';
import {
  CURRENT_WHITELIST_VERSION,
  DEFAULT_PUBKEY,
  RUST_VEC_SIZE,
  WHITELIST_V2_BASE_SIZE,
  WHITELIST_V2_CONDITION_SIZE,
  createWhitelist,
  createWhitelistThrows,
  generateUuid,
  getAccountDataLength,
} from './_common';

const MAX_CONDITIONS = 24;

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
  t.like(await fetchWhitelistV2(client.rpc, whitelist), {
    address: whitelist,
    data: {
      version: CURRENT_WHITELIST_VERSION,
      updateAuthority: updateAuthority.address,
      namespace: namespace.address,
      freezeAuthority,
      uuid,
      conditions,
      state: State.Unfrozen,
    },
  });

  // Data is the right length.
  const dataLength = await getAccountDataLength(client, whitelist);

  t.assert(
    dataLength ===
      WHITELIST_V2_BASE_SIZE +
        RUST_VEC_SIZE +
        WHITELIST_V2_CONDITION_SIZE * conditions.length
  );
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
  t.like(await fetchWhitelistV2(client.rpc, whitelist), {
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

test('it throws when creating a whitelist v2 with an empty conditions list', async (t) => {
  const client = createDefaultSolanaClient();
  const updateAuthority = await generateKeyPairSignerWithSol(client);

  const conditions: Condition[] = [];

  await createWhitelistThrows({
    client,
    updateAuthority,
    conditions,
    t,
    code: TENSOR_WHITELIST_ERROR__EMPTY_CONDITIONS,
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
    code: TENSOR_WHITELIST_ERROR__TOO_MANY_MERKLE_PROOFS,
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

  // Merkle should be moved to the first index.
  let expectedConditions = [
    { mode: Mode.MerkleTree, value: merkleProof1 },
    { mode: Mode.FVC, value: updateAuthority.address },
  ];

  // Then a whitelist authority was created with the correct data.
  t.like(await fetchWhitelistV2(client.rpc, whitelist), {
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

  // Merkle should be moved to the first index.
  expectedConditions = [
    { mode: Mode.MerkleTree, value: merkleProof1 },
    { mode: Mode.FVC, value: updateAuthority.address },
    { mode: Mode.FVC, value: updateAuthority.address },
    { mode: Mode.VOC, value: updateAuthority.address },
    { mode: Mode.VOC, value: updateAuthority.address },
  ];

  // Then a whitelist authority was created with the correct data.
  t.like(await fetchWhitelistV2(client.rpc, whitelist), {
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
  t.like(await fetchWhitelistV2(client.rpc, whitelist), {
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

test('it can create a whitelist v2 of max length', async (t) => {
  const client = createDefaultSolanaClient();
  const updateAuthority = await generateKeyPairSignerWithSol(client);
  const freezeAuthority = (await generateKeyPairSigner()).address;
  const namespace = await generateKeyPairSigner();

  const conditions = new Array(MAX_CONDITIONS).fill({
    mode: Mode.FVC,
    value: updateAuthority.address,
  });

  const { whitelist, uuid } = await createWhitelist({
    client,
    updateAuthority,
    freezeAuthority,
    conditions,
    namespace,
  });

  // Then a whitelist authority was created with the correct data.
  t.like(await fetchWhitelistV2(client.rpc, whitelist), {
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

test('it throws when trying to create a whitelist v2 more than max length', async (t) => {
  const client = createDefaultSolanaClient();
  const updateAuthority = await generateKeyPairSignerWithSol(client);
  const freezeAuthority = (await generateKeyPairSigner()).address;
  const namespace = await generateKeyPairSigner();

  const conditions = new Array(MAX_CONDITIONS + 1).fill({
    mode: Mode.FVC,
    value: updateAuthority.address,
  });

  const uuid = generateUuid();

  const [whitelist] = await findWhitelistV2Pda({
    namespace: namespace.address,
    uuid,
  });

  const createWhitelistIx = getCreateWhitelistV2Instruction({
    payer: updateAuthority,
    updateAuthority,
    namespace,
    whitelist,
    freezeAuthority,
    conditions,
    uuid,
  });

  const promise = pipe(
    await createDefaultTransaction(client, updateAuthority),
    (tx) => appendTransactionMessageInstruction(createWhitelistIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  const error = await t.throwsAsync<Error & { data: { logs: string[] } }>(
    promise
  );

  if (isSolanaError(error, SOLANA_ERROR__JSON_RPC__INVALID_PARAMS)) {
    t.regex(error.context.__serverMessage, / too large: 1652 bytes/);
  }
});

test('it can create a whitelist v2 funded by a separate payer', async (t) => {
  const client = createDefaultSolanaClient();

  // Payer has funds.
  const payer = await generateKeyPairSignerWithSol(client);

  // No funds, so can't pay.
  const updateAuthority = await generateKeyPairSigner();

  // Also no funds.
  const namespace = await generateKeyPairSigner();

  const freezeAuthority = (await generateKeyPairSigner()).address;
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
  t.like(await fetchWhitelistV2(client.rpc, whitelist), {
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
