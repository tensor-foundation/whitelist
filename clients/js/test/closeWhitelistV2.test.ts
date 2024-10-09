import {
  appendTransactionMessageInstruction,
  generateKeyPairSigner,
  pipe,
} from '@solana/web3.js';
import {
  createDefaultSolanaClient,
  createDefaultTransaction,
  generateKeyPairSignerWithSol,
  getBalance,
  signAndSendTransaction,
} from '@tensor-foundation/test-helpers';
import test from 'ava';
import {
  Condition,
  fetchMaybeWhitelistV2,
  fetchWhitelistV2,
  getCloseWhitelistV2Instruction,
  getFreezeWhitelistV2Instruction,
  Mode,
  State,
  TENSOR_WHITELIST_ERROR__INVALID_AUTHORITY,
  TENSOR_WHITELIST_ERROR__WHITELIST_IS_FROZEN,
} from '../src';
import {
  createWhitelist,
  expectCustomError,
  RUST_VEC_SIZE,
  TRANSACTION_FEE,
  WHITELIST_V2_BASE_SIZE,
  WHITELIST_V2_CONDITION_SIZE,
} from './_common';

test('it can close a whitelist v2', async (t) => {
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

  // Then a whitelist was created with the correct data.
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

  const whitelistV2Size =
    WHITELIST_V2_BASE_SIZE +
    RUST_VEC_SIZE +
    conditions.length * WHITELIST_V2_CONDITION_SIZE;
  const whitelistV2Rent = await client.rpc
    .getMinimumBalanceForRentExemption(BigInt(whitelistV2Size))
    .send();
  const startingBalance = await getBalance(client, updateAuthority.address);

  // When the whitelist is closed.
  const closeWhitelistIx = getCloseWhitelistV2Instruction({
    updateAuthority,
    whitelist,
    rentDestination: updateAuthority.address,
  });

  await pipe(
    await createDefaultTransaction(client, updateAuthority),
    (tx) => appendTransactionMessageInstruction(closeWhitelistIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  // Then the whitelist is not on-chain.
  const maybeAccount = await fetchMaybeWhitelistV2(client.rpc, whitelist);
  t.assert(!maybeAccount.exists);

  // Then the rent destination receives the rent.
  const rentDestinationBalance = await getBalance(
    client,
    updateAuthority.address
  );
  t.assert(
    rentDestinationBalance ==
      whitelistV2Rent + startingBalance - TRANSACTION_FEE
  );
});

test('cannot close a frozen whitelist v2', async (t) => {
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
    freezeAuthority: updateAuthority.address,
  });

  t.like(await fetchWhitelistV2(client.rpc, whitelist), {
    address: whitelist,
    data: {
      updateAuthority: updateAuthority.address,
      namespace: namespace.address,
      freezeAuthority: updateAuthority.address,
      uuid,
      conditions,
    },
  });

  // Freeze the whitelist.
  const freezeWhitelistIx = getFreezeWhitelistV2Instruction({
    freezeAuthority: updateAuthority,
    whitelist,
  });

  await pipe(
    await createDefaultTransaction(client, updateAuthority),
    (tx) => appendTransactionMessageInstruction(freezeWhitelistIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  // Then the whitelist is frozen.
  t.like(await fetchWhitelistV2(client.rpc, whitelist), {
    address: whitelist,
    data: {
      state: State.Frozen,
    },
  });

  const closeWhitelistIx = getCloseWhitelistV2Instruction({
    updateAuthority,
    whitelist,
    rentDestination: updateAuthority.address,
  });

  const promise = pipe(
    await createDefaultTransaction(client, updateAuthority),
    (tx) => appendTransactionMessageInstruction(closeWhitelistIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  // The whitelist cannot be closed and fails with the correct error.
  await expectCustomError(
    t,
    promise,
    TENSOR_WHITELIST_ERROR__WHITELIST_IS_FROZEN
  );
});

test('cannot close a whitelist v2 with an invalid update authority', async (t) => {
  const client = createDefaultSolanaClient();
  const updateAuthority = await generateKeyPairSignerWithSol(client);
  const namespace = await generateKeyPairSigner();

  const invalidUpdateAuthority = await generateKeyPairSignerWithSol(client);

  const conditions: Condition[] = [
    { mode: Mode.FVC, value: updateAuthority.address },
  ];

  const { whitelist } = await createWhitelist({
    client,
    updateAuthority,
    conditions,
    namespace,
    freezeAuthority: updateAuthority.address,
  });

  const closeWhitelistIx = getCloseWhitelistV2Instruction({
    updateAuthority: invalidUpdateAuthority,
    whitelist,
    rentDestination: updateAuthority.address,
  });

  const promise = pipe(
    await createDefaultTransaction(client, updateAuthority),
    (tx) => appendTransactionMessageInstruction(closeWhitelistIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  await expectCustomError(
    t,
    promise,
    TENSOR_WHITELIST_ERROR__INVALID_AUTHORITY
  );
});

test('cannot close another whitelist v2 with a valid update authority', async (t) => {
  const client = createDefaultSolanaClient();
  const updateAuthorityA = await generateKeyPairSignerWithSol(client);
  const updateAuthorityB = await generateKeyPairSignerWithSol(client);
  const namespaceA = await generateKeyPairSigner();
  const namespaceB = await generateKeyPairSigner();

  const conditionsA: Condition[] = [
    { mode: Mode.FVC, value: updateAuthorityA.address },
  ];
  const conditionsB: Condition[] = [
    { mode: Mode.FVC, value: updateAuthorityA.address },
  ];

  const { whitelist: whitelistA } = await createWhitelist({
    client,
    updateAuthority: updateAuthorityA,
    conditions: conditionsA,
    namespace: namespaceA,
    freezeAuthority: updateAuthorityA.address,
  });

  const { whitelist: whitelistB } = await createWhitelist({
    client,
    updateAuthority: updateAuthorityB,
    conditions: conditionsB,
    namespace: namespaceB,
    freezeAuthority: updateAuthorityB.address,
  });

  const closeWhitelistAIx = getCloseWhitelistV2Instruction({
    updateAuthority: updateAuthorityB,
    whitelist: whitelistA,
    rentDestination: updateAuthorityA.address,
  });

  const closeWhitelistBIx = getCloseWhitelistV2Instruction({
    updateAuthority: updateAuthorityA,
    whitelist: whitelistB,
    rentDestination: updateAuthorityB.address,
  });

  let promise = pipe(
    await createDefaultTransaction(client, updateAuthorityA),
    (tx) => appendTransactionMessageInstruction(closeWhitelistAIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  await expectCustomError(
    t,
    promise,
    TENSOR_WHITELIST_ERROR__INVALID_AUTHORITY
  );

  promise = pipe(
    await createDefaultTransaction(client, updateAuthorityA),
    (tx) => appendTransactionMessageInstruction(closeWhitelistBIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  await expectCustomError(
    t,
    promise,
    TENSOR_WHITELIST_ERROR__INVALID_AUTHORITY
  );
});

test('rent destination receives rent when closing a whitelist v2', async (t) => {
  const client = createDefaultSolanaClient();

  const updateAuthority = await generateKeyPairSignerWithSol(client);
  const namespace = await generateKeyPairSigner();
  const rentDestination = await generateKeyPairSigner();
  const conditions: Condition[] = [
    { mode: Mode.FVC, value: updateAuthority.address },
  ];

  const whitelistV2Size =
    WHITELIST_V2_BASE_SIZE +
    RUST_VEC_SIZE +
    conditions.length * WHITELIST_V2_CONDITION_SIZE;
  const whitelistV2Rent = await client.rpc
    .getMinimumBalanceForRentExemption(BigInt(whitelistV2Size))
    .send();

  const { whitelist } = await createWhitelist({
    client,
    updateAuthority,
    conditions,
    namespace,
    freezeAuthority: updateAuthority.address,
  });

  const closeWhitelistIx = getCloseWhitelistV2Instruction({
    updateAuthority,
    whitelist,
    rentDestination: rentDestination.address,
  });

  await pipe(
    await createDefaultTransaction(client, updateAuthority),
    (tx) => appendTransactionMessageInstruction(closeWhitelistIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  // Rent destination receives rent.
  const rentDestinationBalance = await getBalance(
    client,
    rentDestination.address
  );
  t.assert(rentDestinationBalance == whitelistV2Rent);
});
