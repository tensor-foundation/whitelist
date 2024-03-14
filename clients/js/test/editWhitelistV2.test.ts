import test from 'ava';
import { appendTransactionInstruction, pipe } from '@solana/web3.js';
import { generateKeyPairSigner } from '@solana/signers';
import {
  createDefaultSolanaClient,
  createDefaultTransaction,
  generateKeyPairSignerWithSol,
  signAndSendTransaction,
} from './_setup';
import {
  Condition,
  Mode,
  WhitelistV2,
  fetchWhitelistV2,
  getEditWhitelistV2Instruction,
  toggle,
} from '../src';
import { createWhitelist, getAccountDataLength } from './_common';

test('it can edit a whitelist v2, reallocing to be larger', async (t) => {
  const client = createDefaultSolanaClient();
  const updateAuthority = await generateKeyPairSignerWithSol(client);
  const voc = (await generateKeyPairSigner()).address;

  // Default conditions size is one item
  const { whitelist, uuid, conditions } = await createWhitelist({
    client,
    updateAuthority,
  });

  t.like(await fetchWhitelistV2(client.rpc, whitelist), <WhitelistV2>(<unknown>{
    address: whitelist,
    data: {
      updateAuthority: updateAuthority.address,
      uuid,
      conditions,
    },
  }));

  const originalAccountSize = await getAccountDataLength(client, whitelist);

  // Make a larger conditions list
  const newConditions = [
    { mode: Mode.VOC, value: voc },
    { mode: Mode.FVC, value: updateAuthority.address },
    { mode: Mode.FVC, value: updateAuthority.address },
    { mode: Mode.FVC, value: updateAuthority.address },
    { mode: Mode.FVC, value: updateAuthority.address },
    { mode: Mode.FVC, value: updateAuthority.address },
  ];

  const editWhitelistIx = getEditWhitelistV2Instruction({
    updateAuthority,
    whitelist,
    conditions: newConditions,
    freezeAuthority: toggle('None'),
  });

  await pipe(
    await createDefaultTransaction(client, updateAuthority.address),
    (tx) => appendTransactionInstruction(editWhitelistIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  t.like(await fetchWhitelistV2(client.rpc, whitelist), <WhitelistV2>(<unknown>{
    address: whitelist,
    data: {
      updateAuthority: updateAuthority.address,
      uuid,
      conditions: newConditions,
    },
  }));

  const newAccountSize = await getAccountDataLength(client, whitelist);

  t.true(newAccountSize > originalAccountSize);
});

test('it can edit a whitelist v2 reallocing to be smaller', async (t) => {
  const client = createDefaultSolanaClient();
  const updateAuthority = await generateKeyPairSignerWithSol(client);
  const voc = (await generateKeyPairSigner()).address;

  // Start with larger conditions size
  const conditions = [
    { mode: Mode.VOC, value: voc },
    { mode: Mode.FVC, value: updateAuthority.address },
    { mode: Mode.FVC, value: updateAuthority.address },
    { mode: Mode.FVC, value: updateAuthority.address },
    { mode: Mode.FVC, value: updateAuthority.address },
  ];

  const { whitelist, uuid } = await createWhitelist({
    client,
    updateAuthority,
    conditions,
  });

  const originalAccountSize = await getAccountDataLength(client, whitelist);

  t.like(await fetchWhitelistV2(client.rpc, whitelist), <WhitelistV2>(<unknown>{
    address: whitelist,
    data: {
      updateAuthority: updateAuthority.address,
      uuid,
      conditions,
    },
  }));

  const newConditions: Condition[] = [{ mode: Mode.VOC, value: voc }];

  const editWhitelistIx = getEditWhitelistV2Instruction({
    updateAuthority,
    whitelist,
    conditions: newConditions,
    freezeAuthority: toggle('None'),
  });

  await pipe(
    await createDefaultTransaction(client, updateAuthority.address),
    (tx) => appendTransactionInstruction(editWhitelistIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  const newAccountSize = await getAccountDataLength(client, whitelist);

  t.like(await fetchWhitelistV2(client.rpc, whitelist), <WhitelistV2>(<unknown>{
    address: whitelist,
    data: {
      updateAuthority: updateAuthority.address,
      uuid,
      conditions: newConditions,
    },
  }));

  t.true(newAccountSize < originalAccountSize);
});

test('it cannot edit a whitelist v2 with the wrong authority', async (t) => {
  const client = createDefaultSolanaClient();
  const updateAuthority = await generateKeyPairSignerWithSol(client);
  const wrongAuthority = await generateKeyPairSignerWithSol(client);
  const voc = (await generateKeyPairSigner()).address;

  const { whitelist, uuid, conditions } = await createWhitelist({
    client,
    updateAuthority,
  });

  t.like(await fetchWhitelistV2(client.rpc, whitelist), <WhitelistV2>(<unknown>{
    address: whitelist,
    data: {
      updateAuthority: updateAuthority.address,
      uuid,
      conditions,
    },
  }));

  const newConditions = [
    { mode: Mode.VOC, value: voc },
    { mode: Mode.FVC, value: updateAuthority.address },
  ];

  const editWhitelistIx = getEditWhitelistV2Instruction({
    updateAuthority: wrongAuthority,
    whitelist,
    conditions: newConditions,
    freezeAuthority: toggle('None'),
  });

  const promise = pipe(
    await createDefaultTransaction(client, wrongAuthority.address),
    (tx) => appendTransactionInstruction(editWhitelistIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  // 0x177a - Error Number: 6010. Error Message: invalid authority.'
  await t.throwsAsync(promise, { message: /0x177a/ });
});
