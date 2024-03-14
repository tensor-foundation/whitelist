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
  const payer = await generateKeyPairSignerWithSol(client);

  // TODO: rest of the owl
});
