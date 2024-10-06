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
  Mode,
  State,
  TENSOR_WHITELIST_ERROR__INVALID_AUTHORITY,
  TENSOR_WHITELIST_ERROR__WHITELIST_IS_FROZEN,
  fetchMaybeWhitelistV2,
  fetchWhitelistV2,
  getCloseWhitelistV2Instruction,
  getFreezeWhitelistV2Instruction,
} from '../src';
import {
  createWhitelist,
  expectCustomError,
  RUST_VEC_SIZE,
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
