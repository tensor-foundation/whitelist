import test from 'ava';
import {
  createDefaultSolanaClient,
  generateKeyPairSignerWithSol,
} from './_setup';
import { WhitelistV2, fetchWhitelistV2 } from '../src';
import { createWhitelist, padConditions } from './_common';

test('it can create a whitelist v2', async (t) => {
  const client = createDefaultSolanaClient();
  const authority = await generateKeyPairSignerWithSol(client);

  const { whitelist, uuid, conditions } = await createWhitelist(
    client,
    authority
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

  const conditions = padConditions([]);

  const { whitelist, uuid } = await createWhitelist(
    client,
    authority,
    conditions
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
