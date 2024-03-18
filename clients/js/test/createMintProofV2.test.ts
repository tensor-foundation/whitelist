import test from 'ava';
import { address } from '@solana/addresses';

import bs58 from 'bs58';
import { appendTransactionInstruction, pipe } from '@solana/web3.js';
import {
  createDefaultSolanaClient,
  createDefaultTransaction,
  generateKeyPairSignerWithSol,
  signAndSendTransaction,
} from './_setup';
import { generateTreeOfSize } from './_merkle';
import { DEFAULT_PUBKEY, createWhitelist } from './_common';
import {
  Mode,
  WhitelistV2,
  fetchWhitelistV2,
  findMintProofPda,
  getCreateMintProofV2Instruction,
} from '../src';
import { mintNft } from './_mint';

test('it can create a mint proof v2', async (t) => {
  const client = createDefaultSolanaClient();
  const payer = await generateKeyPairSignerWithSol(client);
  const updateAuthority = await generateKeyPairSignerWithSol(client);

  const mint = await mintNft();

  const merkleTree = await generateTreeOfSize(10, [mint]);
  const root = address(bs58.encode(merkleTree.root));

  const conditions = [{ mode: Mode.MerkleTree, value: root }];

  const { whitelist, uuid } = await createWhitelist({
    client,
    updateAuthority,
    conditions,
  });

  // Then a whitelist authority was created with the correct data.
  t.like(await fetchWhitelistV2(client.rpc, whitelist), <WhitelistV2>(<unknown>{
    address: whitelist,
    data: {
      updateAuthority: updateAuthority.address,
      freezeAuthority: DEFAULT_PUBKEY,
      uuid,
      conditions,
    },
  }));

  const [mintProof] = await findMintProofPda({ mint, whitelist });

  const createMintProofIx = getCreateMintProofV2Instruction({
    payer,
    mint,
    whitelist,
    mintProof,
    proof: merkleTree.proofs[0].proof,
  });

  await pipe(
    await createDefaultTransaction(client, payer.address),
    (tx) => appendTransactionInstruction(createMintProofIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );
});
