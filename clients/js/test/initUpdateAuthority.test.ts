import { appendTransactionInstruction } from '@solana/transactions';
import { pipe } from '@solana/web3.js';
import test from 'ava';
import {
  Authority,
  fetchAuthority,
  findAuthorityPda,
  getInitUpdateAuthorityInstructionAsync,
} from '../src';
import {
  createDefaultSolanaClient,
  createDefaultTransaction,
  setupSigners,
  signAndSendTransaction,
} from './_setup';

test('it can initialize a new update authority', async (t) => {
  // Given a Umi instance and a new signer.
  const client = createDefaultSolanaClient();
  const { cosigner, owner } = await setupSigners(client);

  // When we initialize a new update authority.
  const initUpdateAuthority = await getInitUpdateAuthorityInstructionAsync({
    cosigner: cosigner,
    owner: owner,
    newCosigner: cosigner.address,
    newOwner: owner.address,
  });

  await pipe(
    await createDefaultTransaction(client, cosigner.address),
    (tx) => appendTransactionInstruction(initUpdateAuthority, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  // Then a whitelist authority was created with the correct data.
  const [authority] = await findAuthorityPda();
  t.like(await fetchAuthority(client.rpc, authority), <Authority>{
    address: authority,
    data: {
      owner: owner.address,
      cosigner: cosigner.address,
    },
  });
});