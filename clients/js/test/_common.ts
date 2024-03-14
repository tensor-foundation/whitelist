import { v4 } from 'uuid';
import { Address, address } from '@solana/addresses';
import { KeyPairSigner, generateKeyPairSigner } from '@solana/signers';
import { appendTransactionInstruction, pipe } from '@solana/web3.js';
import {
  Condition,
  Mode,
  findWhitelistV2Pda,
  getCreateWhitelistV2Instruction,
} from '../src';
import {
  Client,
  createDefaultTransaction,
  signAndSendTransaction,
} from './_setup';

export const DEFAULT_PUBKEY: Address = address(
  '11111111111111111111111111111111'
);

export const uuidToUint8Array = (uuid: string) => {
  const encoder = new TextEncoder();
  // replace any '-' to handle uuids
  return encoder.encode(uuid.replaceAll('-', ''));
};

export const generateUuid = () => uuidToUint8Array(v4());

export const createWhitelist = async (
  client: Client,
  updateAuthority: KeyPairSigner,
  freezeAuthority: Address = DEFAULT_PUBKEY,
  conditions: Condition[] = [
    { mode: Mode.FVC, value: updateAuthority.address },
  ],
  namespace?: KeyPairSigner
) => {
  const uuid = generateUuid();
  namespace = namespace || (await generateKeyPairSigner());

  const [whitelist] = await findWhitelistV2Pda({
    namespace: namespace.address,
    uuid,
  });

  const createWhitelistIx = getCreateWhitelistV2Instruction({
    payer: updateAuthority,
    updateAuthority,
    namespace,
    whitelist,
    freezeAuthority,
    conditions,
    uuid,
  });

  await pipe(
    await createDefaultTransaction(client, updateAuthority.address),
    (tx) => appendTransactionInstruction(createWhitelistIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  return { whitelist, uuid, conditions };
};
