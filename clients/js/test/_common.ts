import { v4 } from 'uuid';
import { Address, address } from '@solana/addresses';
import { KeyPairSigner, generateKeyPairSigner } from '@solana/signers';
import { appendTransactionInstruction, pipe } from '@solana/web3.js';
import { Buffer } from 'buffer';
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

export interface CreateWhitelistParams {
  client: Client;
  updateAuthority: KeyPairSigner;
  namespace?: KeyPairSigner;
  freezeAuthority?: Address;
  conditions?: Condition[];
}

export interface CreateWhitelistReturns {
  whitelist: Address;
  uuid: Uint8Array;
  conditions: Condition[];
}

export async function createWhitelist({
  client,
  updateAuthority,
  namespace,
  freezeAuthority = DEFAULT_PUBKEY,
  conditions = [{ mode: Mode.FVC, value: updateAuthority.address }],
}: CreateWhitelistParams): Promise<CreateWhitelistReturns> {
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
}

export async function getAccountDataLength(
  client: Client,
  address: Address
): Promise<number> {
  const account = await client.rpc
    .getAccountInfo(address, { encoding: 'base64' })
    .send();

  const base64Data = account?.value?.data[0];

  const decodedData = base64Data
    ? Buffer.from(base64Data, 'base64')
    : undefined;

  const originalAccountSize = decodedData?.length ?? 0;

  return originalAccountSize;
}
