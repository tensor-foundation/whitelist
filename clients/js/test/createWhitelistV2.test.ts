import test from 'ava';
import {
  createDefaultSolanaClient,
  generateKeyPairSignerWithSol,
} from './_setup';
import { Condition, Mode, WhitelistV2, fetchWhitelistV2 } from '../src';
import { DEFAULT_PUBKEY, createWhitelist } from './_common';
import { generateKeyPairSigner } from '@solana/signers';

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
  t.like(await fetchWhitelistV2(client.rpc, whitelist), <WhitelistV2>(<unknown>{
    address: whitelist,
    data: {
      updateAuthority: updateAuthority.address,
      namespace: namespace.address,
      freezeAuthority,
      uuid,
      conditions,
    },
  }));
});

test('creating a whitelistv2 with no freeze authority defaults to system pubkey', async (t) => {
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
  t.like(await fetchWhitelistV2(client.rpc, whitelist), <WhitelistV2>(<unknown>{
    address: whitelist,
    data: {
      updateAuthority: updateAuthority.address,
      namespace: namespace.address,
      freezeAuthority: DEFAULT_PUBKEY,
      uuid,
      conditions,
    },
  }));
});

test('it can create an empty whitelist v2', async (t) => {
  const client = createDefaultSolanaClient();
  const updateAuthority = await generateKeyPairSignerWithSol(client);

  const conditions: Condition[] = [];

  const { whitelist, uuid } = await createWhitelist({
    client,
    updateAuthority,
    conditions,
  });

  // Then a whitelist updateAuthority was created with the correct data.
  t.like(await fetchWhitelistV2(client.rpc, whitelist), <WhitelistV2>(<unknown>{
    address: whitelist,
    data: {
      updateAuthority: updateAuthority.address,
      uuid,
      conditions,
    },
  }));
});
