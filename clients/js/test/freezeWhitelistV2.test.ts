import test from 'ava';
import { appendTransactionInstruction, pipe } from '@solana/web3.js';
import {
  createDefaultSolanaClient,
  createDefaultTransaction,
  generateKeyPairSignerWithSol,
  signAndSendTransaction,
} from './_setup';
import {
  Mode,
  State,
  WhitelistV2,
  fetchWhitelistV2,
  getUpdateWhitelistV2Instruction,
  getFreezeWhitelistV2Instruction,
  getUnfreezeWhitelistV2Instruction,
  toggle,
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
  t.like(await fetchWhitelistV2(client.rpc, whitelist), <WhitelistV2>(<unknown>{
    address: whitelist,
    data: {
      updateAuthority: updateAuthority.address,
      uuid,
      conditions,
      state: State.Unfrozen,
    },
  }));

  // Freeze
  const freezeWhitelistIx = getFreezeWhitelistV2Instruction({
    freezeAuthority,
    whitelist,
  });

  await pipe(
    await createDefaultTransaction(client, freezeAuthority.address),
    (tx) => appendTransactionInstruction(freezeWhitelistIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  t.like(await fetchWhitelistV2(client.rpc, whitelist), <WhitelistV2>(<unknown>{
    address: whitelist,
    data: {
      updateAuthority: updateAuthority.address,
      uuid,
      // Is frozen
      state: State.Frozen,
      conditions,
    },
  }));

  // Unfreeze
  const unfreezeWhitelistIx = getUnfreezeWhitelistV2Instruction({
    freezeAuthority,
    whitelist,
  });

  await pipe(
    await createDefaultTransaction(client, freezeAuthority.address),
    (tx) => appendTransactionInstruction(unfreezeWhitelistIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  t.like(await fetchWhitelistV2(client.rpc, whitelist), <WhitelistV2>(<unknown>{
    address: whitelist,
    data: {
      updateAuthority: updateAuthority.address,
      uuid,
      // Is unfrozen
      state: State.Unfrozen,
      conditions,
    },
  }));
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
  t.like(await fetchWhitelistV2(client.rpc, whitelist), <WhitelistV2>(<unknown>{
    address: whitelist,
    data: {
      updateAuthority: updateAuthority.address,
      uuid,
      conditions,
      state: State.Unfrozen,
    },
  }));

  // Freeze
  const freezeWhitelistIx = getFreezeWhitelistV2Instruction({
    freezeAuthority,
    whitelist,
  });

  await pipe(
    await createDefaultTransaction(client, freezeAuthority.address),
    (tx) => appendTransactionInstruction(freezeWhitelistIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  t.like(await fetchWhitelistV2(client.rpc, whitelist), <WhitelistV2>(<unknown>{
    address: whitelist,
    data: {
      updateAuthority: updateAuthority.address,
      uuid,
      // Is frozen
      state: State.Frozen,
      conditions,
    },
  }));

  const newConditions = [
    { mode: Mode.VOC, value: voc },
    { mode: Mode.FVC, value: updateAuthority.address },
  ];

  // Try to update
  const editWhitelistIx = getUpdateWhitelistV2Instruction({
    updateAuthority,
    whitelist,
    conditions: newConditions,
    freezeAuthority: toggle('None'),
  });

  const promise = pipe(
    await createDefaultTransaction(client, updateAuthority.address),
    (tx) => appendTransactionInstruction(editWhitelistIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  // Cannot update: 0x177f / 6015 WhitelistIsFrozen
  await t.throwsAsync(promise, {
    message: /custom program error: 0x177f/,
  });
});
