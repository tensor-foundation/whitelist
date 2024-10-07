import { ANCHOR_ERROR__CONSTRAINT_HAS_ONE } from '@coral-xyz/anchor-errors';
import { appendTransactionMessageInstruction, pipe } from '@solana/web3.js';
import {
  createDefaultSolanaClient,
  createDefaultTransaction,
  generateKeyPairSignerWithSol,
  signAndSendTransaction,
} from '@tensor-foundation/test-helpers';
import test from 'ava';
import {
  Mode,
  State,
  TENSOR_WHITELIST_ERROR__WHITELIST_IS_FROZEN,
  fetchWhitelistV2,
  getFreezeWhitelistV2Instruction,
  getUnfreezeWhitelistV2Instruction,
  getUpdateWhitelistV2Instruction,
  operation,
} from '../src';
import { createWhitelist, expectCustomError } from './_common';

test('it can freeze and unfreeze a whitelist v2', async (t) => {
  const client = createDefaultSolanaClient();
  const updateAuthority = await generateKeyPairSignerWithSol(client);
  const freezeAuthority = await generateKeyPairSignerWithSol(client);

  // Create a whitelist with a freeze authority set.
  const { whitelist, uuid, conditions } = await createWhitelist({
    client,
    updateAuthority,
    freezeAuthority: freezeAuthority.address,
  });

  // It was created correctly, and is unfrozen.
  t.like(await fetchWhitelistV2(client.rpc, whitelist), {
    address: whitelist,
    data: {
      updateAuthority: updateAuthority.address,
      freezeAuthority: freezeAuthority.address,
      uuid,
      conditions,
      state: State.Unfrozen,
    },
  });

  // Freeze
  const freezeWhitelistIx = getFreezeWhitelistV2Instruction({
    freezeAuthority,
    whitelist,
  });

  await pipe(
    await createDefaultTransaction(client, freezeAuthority),
    (tx) => appendTransactionMessageInstruction(freezeWhitelistIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  t.like(await fetchWhitelistV2(client.rpc, whitelist), {
    address: whitelist,
    data: {
      updateAuthority: updateAuthority.address,
      freezeAuthority: freezeAuthority.address,
      uuid,
      // Is frozen
      state: State.Frozen,
      conditions,
    },
  });

  // Unfreeze
  const unfreezeWhitelistIx = getUnfreezeWhitelistV2Instruction({
    freezeAuthority,
    whitelist,
  });

  await pipe(
    await createDefaultTransaction(client, freezeAuthority),
    (tx) => appendTransactionMessageInstruction(unfreezeWhitelistIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  t.like(await fetchWhitelistV2(client.rpc, whitelist), {
    address: whitelist,
    data: {
      updateAuthority: updateAuthority.address,
      freezeAuthority: freezeAuthority.address,
      uuid,
      // Is unfrozen
      state: State.Unfrozen,
      conditions,
    },
  });
});

test('a frozen whitelist v2 cannot be updated', async (t) => {
  const client = createDefaultSolanaClient();
  const updateAuthority = await generateKeyPairSignerWithSol(client);
  const voc = (await generateKeyPairSignerWithSol(client)).address;

  // Funded to pay for the freeze transactions.
  const freezeAuthority = await generateKeyPairSignerWithSol(client);

  // Create a whitelist with a freeze authority set.
  const { whitelist, uuid, conditions } = await createWhitelist({
    client,
    updateAuthority,
    freezeAuthority: freezeAuthority.address,
  });

  // It was created correctly, and is unfrozen.
  t.like(await fetchWhitelistV2(client.rpc, whitelist), {
    address: whitelist,
    data: {
      updateAuthority: updateAuthority.address,
      freezeAuthority: freezeAuthority.address,
      uuid,
      conditions,
      state: State.Unfrozen,
    },
  });

  // Freeze
  const freezeWhitelistIx = getFreezeWhitelistV2Instruction({
    freezeAuthority,
    whitelist,
  });

  await pipe(
    await createDefaultTransaction(client, freezeAuthority),
    (tx) => appendTransactionMessageInstruction(freezeWhitelistIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  t.like(await fetchWhitelistV2(client.rpc, whitelist), {
    address: whitelist,
    data: {
      updateAuthority: updateAuthority.address,
      freezeAuthority: freezeAuthority.address,
      uuid,
      // Is frozen
      state: State.Frozen,
      conditions,
    },
  });

  const newConditions = [
    { mode: Mode.VOC, value: voc },
    { mode: Mode.FVC, value: updateAuthority.address },
  ];

  // Try to update
  const editWhitelistIx = getUpdateWhitelistV2Instruction({
    payer: updateAuthority,
    updateAuthority,
    whitelist,
    conditions: newConditions,
    freezeAuthority: operation('Noop'),
  });

  const promise = pipe(
    await createDefaultTransaction(client, updateAuthority),
    (tx) => appendTransactionMessageInstruction(editWhitelistIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  await expectCustomError(
    t,
    promise,
    TENSOR_WHITELIST_ERROR__WHITELIST_IS_FROZEN
  );
});

test('update authority cannot freeze and unfreeze a whitelist v2', async (t) => {
  const client = createDefaultSolanaClient();

  const updateAuthority = await generateKeyPairSignerWithSol(client);
  const freezeAuthority = await generateKeyPairSignerWithSol(client);

  // Create a whitelist with a freeze authority set.
  const { whitelist, uuid, conditions } = await createWhitelist({
    client,
    updateAuthority,
    freezeAuthority: freezeAuthority.address,
  });

  // It was created correctly, and is unfrozen.
  t.like(await fetchWhitelistV2(client.rpc, whitelist), {
    address: whitelist,
    data: {
      updateAuthority: updateAuthority.address,
      freezeAuthority: freezeAuthority.address,
      uuid,
      conditions,
      state: State.Unfrozen,
    },
  });

  // Freeze
  let freezeWhitelistIx = getFreezeWhitelistV2Instruction({
    freezeAuthority: updateAuthority, // Should not be able to freeze
    whitelist,
  });

  let promise = pipe(
    await createDefaultTransaction(client, updateAuthority),
    (tx) => appendTransactionMessageInstruction(freezeWhitelistIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  // Has-one constraint checks that signer is the freeze authority.
  await expectCustomError(t, promise, ANCHOR_ERROR__CONSTRAINT_HAS_ONE);

  // Freeze
  freezeWhitelistIx = getFreezeWhitelistV2Instruction({
    freezeAuthority,
    whitelist,
  });

  await pipe(
    await createDefaultTransaction(client, freezeAuthority),
    (tx) => appendTransactionMessageInstruction(freezeWhitelistIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  const checkState = async () =>
    t.like(await fetchWhitelistV2(client.rpc, whitelist), {
      address: whitelist,
      data: {
        updateAuthority: updateAuthority.address,
        freezeAuthority: freezeAuthority.address,
        uuid,
        // Is now frozen
        state: State.Frozen,
        conditions,
      },
    });
  await checkState();

  // Fail to Unfreeze
  const unfreezeWhitelistIx = getUnfreezeWhitelistV2Instruction({
    freezeAuthority: updateAuthority,
    whitelist,
  });

  promise = pipe(
    await createDefaultTransaction(client, updateAuthority),
    (tx) => appendTransactionMessageInstruction(unfreezeWhitelistIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  // Has-one constraint checks that signer is the freeze authority.
  await expectCustomError(t, promise, ANCHOR_ERROR__CONSTRAINT_HAS_ONE);

  await checkState();
});

test('freezing is idempotent', async (t) => {
  const client = createDefaultSolanaClient();
  const updateAuthority = await generateKeyPairSignerWithSol(client);
  const freezeAuthority = await generateKeyPairSignerWithSol(client);

  // Create a whitelist with a freeze authority set.
  const { whitelist, uuid, conditions } = await createWhitelist({
    client,
    updateAuthority,
    freezeAuthority: freezeAuthority.address,
  });

  // It was created correctly, and is unfrozen.
  t.like(await fetchWhitelistV2(client.rpc, whitelist), {
    address: whitelist,
    data: {
      updateAuthority: updateAuthority.address,
      freezeAuthority: freezeAuthority.address,
      uuid,
      conditions,
      state: State.Unfrozen,
    },
  });

  // Freeze
  const freezeWhitelistIx = getFreezeWhitelistV2Instruction({
    freezeAuthority,
    whitelist,
  });

  await pipe(
    await createDefaultTransaction(client, freezeAuthority),
    (tx) => appendTransactionMessageInstruction(freezeWhitelistIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  t.like(await fetchWhitelistV2(client.rpc, whitelist), {
    address: whitelist,
    data: {
      updateAuthority: updateAuthority.address,
      freezeAuthority: freezeAuthority.address,
      uuid,
      // Is frozen
      state: State.Frozen,
      conditions,
    },
  });

  // Freeze again
  await pipe(
    await createDefaultTransaction(client, freezeAuthority),
    (tx) => appendTransactionMessageInstruction(freezeWhitelistIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  t.like(await fetchWhitelistV2(client.rpc, whitelist), {
    address: whitelist,
    data: {
      updateAuthority: updateAuthority.address,
      freezeAuthority: freezeAuthority.address,
      uuid,
      // Still frozen
      state: State.Frozen,
      conditions,
    },
  });
});

test('unfreezing is idempotent', async (t) => {
  const client = createDefaultSolanaClient();
  const updateAuthority = await generateKeyPairSignerWithSol(client);
  const freezeAuthority = await generateKeyPairSignerWithSol(client);

  // Create a whitelist with a freeze authority set.
  const { whitelist, uuid, conditions } = await createWhitelist({
    client,
    updateAuthority,
    freezeAuthority: freezeAuthority.address,
  });

  // It was created correctly, and is unfrozen.
  t.like(await fetchWhitelistV2(client.rpc, whitelist), {
    address: whitelist,
    data: {
      updateAuthority: updateAuthority.address,
      freezeAuthority: freezeAuthority.address,
      uuid,
      conditions,
      state: State.Unfrozen,
    },
  });

  // Freeze
  const freezeWhitelistIx = getFreezeWhitelistV2Instruction({
    freezeAuthority,
    whitelist,
  });

  await pipe(
    await createDefaultTransaction(client, freezeAuthority),
    (tx) => appendTransactionMessageInstruction(freezeWhitelistIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  t.like(await fetchWhitelistV2(client.rpc, whitelist), {
    address: whitelist,
    data: {
      updateAuthority: updateAuthority.address,
      freezeAuthority: freezeAuthority.address,
      uuid,
      // Is frozen
      state: State.Frozen,
      conditions,
    },
  });

  // Unfreeze
  const unfreezeWhitelistIx = getUnfreezeWhitelistV2Instruction({
    freezeAuthority,
    whitelist,
  });

  await pipe(
    await createDefaultTransaction(client, freezeAuthority),
    (tx) => appendTransactionMessageInstruction(unfreezeWhitelistIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  t.like(await fetchWhitelistV2(client.rpc, whitelist), {
    address: whitelist,
    data: {
      updateAuthority: updateAuthority.address,
      freezeAuthority: freezeAuthority.address,
      uuid,
      // Is unfrozen
      state: State.Unfrozen,
      conditions,
    },
  });

  // Unfreeze again
  await pipe(
    await createDefaultTransaction(client, freezeAuthority),
    (tx) => appendTransactionMessageInstruction(unfreezeWhitelistIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  t.like(await fetchWhitelistV2(client.rpc, whitelist), {
    address: whitelist,
    data: {
      updateAuthority: updateAuthority.address,
      freezeAuthority: freezeAuthority.address,
      uuid,
      // Still unfrozen
      state: State.Unfrozen,
      conditions,
    },
  });
});
