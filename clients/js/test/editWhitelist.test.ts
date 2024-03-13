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
  Mode,
  WhitelistV2,
  fetchWhitelistV2,
  getEditWhitelistV2Instruction,
} from '../src';
import { createWhitelist, padConditions } from './_common';

test('it can edit a whitelist v2', async (t) => {
  const client = createDefaultSolanaClient();
  const authority = await generateKeyPairSignerWithSol(client);
  const voc = (await generateKeyPairSigner()).address;

  const { whitelist, uuid, conditions } = await createWhitelist(
    client,
    authority
  );

  t.like(await fetchWhitelistV2(client.rpc, whitelist), <WhitelistV2>(<unknown>{
    address: whitelist,
    data: {
      authority: authority.address,
      uuid,
      conditions,
    },
  }));

  const newConditions = padConditions([
    { mode: Mode.VOC, value: voc },
    { mode: Mode.FVC, value: authority.address },
  ]);

  const editWhitelistIx = getEditWhitelistV2Instruction({
    authority,
    whitelist,
    conditions: newConditions,
  });

  await pipe(
    await createDefaultTransaction(client, authority.address),
    (tx) => appendTransactionInstruction(editWhitelistIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  t.like(await fetchWhitelistV2(client.rpc, whitelist), <WhitelistV2>(<unknown>{
    address: whitelist,
    data: {
      authority: authority.address,
      uuid,
      conditions: newConditions,
    },
  }));
});

test('it cannot edit a whitelist v2 with the wrong authority', async (t) => {
  const client = createDefaultSolanaClient();
  const authority = await generateKeyPairSignerWithSol(client);
  const wrongAuthority = await generateKeyPairSignerWithSol(client);
  const voc = (await generateKeyPairSigner()).address;

  const { whitelist, uuid, conditions } = await createWhitelist(
    client,
    authority
  );

  t.like(await fetchWhitelistV2(client.rpc, whitelist), <WhitelistV2>(<unknown>{
    address: whitelist,
    data: {
      authority: authority.address,
      uuid,
      conditions,
    },
  }));

  const newConditions = padConditions([
    { mode: Mode.VOC, value: voc },
    { mode: Mode.FVC, value: authority.address },
  ]);

  const editWhitelistIx = getEditWhitelistV2Instruction({
    authority: wrongAuthority,
    whitelist,
    conditions: newConditions,
  });

  const promise = pipe(
    await createDefaultTransaction(client, wrongAuthority.address),
    (tx) => appendTransactionInstruction(editWhitelistIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  // 0x7d6 - 2006 AnchorError: seeds constraint violated
  await t.throwsAsync(promise, { message: /0x7d6/ });
});
