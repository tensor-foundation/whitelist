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
  WhitelistV2,
  fetchWhitelistV2,
  findWhitelistV2Pda,
  getCreateWhitelistV2Instruction,
} from '../src';
import { generateUuid, padConditions } from './_common';

test('it can create a whitelist v2', async (t) => {
  const client = createDefaultSolanaClient();
  const authority = await generateKeyPairSignerWithSol(client);

  const uuid = generateUuid();
  const conditions = padConditions([
    { mode: Mode.FVC, value: authority.address },
  ]);

  const [whitelist] = await findWhitelistV2Pda({
    authority: authority.address,
    uuid,
  });

  const createWhitelistIx = getCreateWhitelistV2Instruction({
    payer: authority,
    authority,
    whitelist,
    conditions,
    uuid,
  });

  await pipe(
    await createDefaultTransaction(client, authority.address),
    (tx) => appendTransactionInstruction(createWhitelistIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  // Then a whitelist authority was created with the correct data.
  t.like(await fetchWhitelistV2(client.rpc, whitelist), <WhitelistV2>(<unknown>{
    address: whitelist,
    data: {
      authority: authority.address,
      uuid,
      conditions,
    },
  }));
});

test('it can create an empty whitelist v2', async (t) => {
  const client = createDefaultSolanaClient();
  const authority = await generateKeyPairSignerWithSol(client);

  const uuid = generateUuid();
  const conditions = padConditions([]);

  const [whitelist] = await findWhitelistV2Pda({
    authority: authority.address,
    uuid,
  });

  const createWhitelistIx = getCreateWhitelistV2Instruction({
    payer: authority,
    authority,
    whitelist,
    conditions,
    uuid,
  });

  await pipe(
    await createDefaultTransaction(client, authority.address),
    (tx) => appendTransactionInstruction(createWhitelistIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  // Then a whitelist authority was created with the correct data.
  t.like(await fetchWhitelistV2(client.rpc, whitelist), <WhitelistV2>(<unknown>{
    address: whitelist,
    data: {
      authority: authority.address,
      uuid,
      conditions,
    },
  }));
});
