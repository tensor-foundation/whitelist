import { v4 } from 'uuid';
import { address } from '@solana/addresses';
import { KeyPairSigner } from '@solana/signers';
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

export const uuidToUint8Array = (uuid: string) => {
  const encoder = new TextEncoder();
  // replace any '-' to handle uuids
  return encoder.encode(uuid.replaceAll('-', ''));
};

export const padConditions = (conditions: Condition[]): Condition[] => {
  if (conditions.length > 5) {
    throw new Error('Too many conditions');
  }

  while (conditions.length < 5) {
    conditions.push({
      mode: Mode.Empty,
      value: address('11111111111111111111111111111111'),
    });
  }

  return conditions;
};

export const generateUuid = () => uuidToUint8Array(v4());

export const createWhitelist = async (
  client: Client,
  authority: KeyPairSigner,
  conditions?: Condition[]
) => {
  const uuid = generateUuid();

  conditions =
    conditions || padConditions([{ mode: Mode.FVC, value: authority.address }]);

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

  return { whitelist, uuid, conditions };
};
