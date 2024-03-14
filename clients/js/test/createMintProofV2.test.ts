import test from 'ava';
import {
  createDefaultSolanaClient,
  generateKeyPairSignerWithSol,
} from './_setup';

test('it can create a whitelist v2', async (t) => {
  const client = createDefaultSolanaClient();
  const payer = await generateKeyPairSignerWithSol(client);

  // Make eslint shut up
  t.true(payer.address.length > 0, 'TODO: implement');

  // TODO: rest of the owl
});
