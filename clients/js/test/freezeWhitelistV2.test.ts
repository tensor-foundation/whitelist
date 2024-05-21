import {
  SOLANA_ERROR__INSTRUCTION_ERROR__CUSTOM,
  appendTransactionMessageInstruction,
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
  Mode,
  State,
  fetchWhitelistV2,
  getFreezeWhitelistV2Instruction,
  getUnfreezeWhitelistV2Instruction,
  getUpdateWhitelistV2Instruction,
  operation,
} from '../src';
import { createWhitelist } from './_common';

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

  const error = await t.throwsAsync<Error & { data: { logs: string[] } }>(
    promise
  );

  if (isSolanaError(error.cause, SOLANA_ERROR__INSTRUCTION_ERROR__CUSTOM)) {
    t.assert(error.cause.context.code === 6016);
  } else {
    // Expected a custom error, but didn't get one.
    t.assert(false);
  }
});
