import test from 'ava';
import {
  createDefaultSolanaClient,
  generateKeyPairSignerWithSol,
} from './_setup';
import { Condition, WhitelistV2, fetchWhitelistV2 } from '../src';
import { createWhitelist } from './_common';

test('it can create a whitelist v2', async (t) => {
  const client = createDefaultSolanaClient();
  const updateAuthority = await generateKeyPairSignerWithSol(client);

  const { whitelist, uuid, conditions } = await createWhitelist(
    client,
    updateAuthority
  );

  // Then a whitelist authority was created with the correct data.
  t.like(await fetchWhitelistV2(client.rpc, whitelist), <WhitelistV2>(<unknown>{
    address: whitelist,
    data: {
      updateAuthority: updateAuthority.address,
      uuid,
      conditions,
    },
  }));
});

test('it can create an empty whitelist v2', async (t) => {
  const client = createDefaultSolanaClient();
  const updateAuthority = await generateKeyPairSignerWithSol(client);

  const conditions: Condition[] = [];

  const { whitelist, uuid } = await createWhitelist(
    client,
    updateAuthority,
    undefined,
    conditions
  );

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
