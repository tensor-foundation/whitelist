import { ExecutionContext } from 'ava';
import { v4 } from 'uuid';
import { Address, address } from '@solana/addresses';
import {
  KeyPairSigner,
  generateKeyPairSigner,
  signTransactionWithSigners,
} from '@solana/signers';
import { none } from '@solana/options';
import {
  Commitment,
  CompilableTransaction,
  ITransactionWithBlockhashLifetime,
  SOLANA_ERROR__INSTRUCTION_ERROR__CUSTOM,
  appendTransactionInstruction,
  getSignatureFromTransaction,
  isSolanaError,
  pipe,
  sendAndConfirmTransactionFactory,
} from '@solana/web3.js';
import { Buffer } from 'buffer';
import {
  Client,
  createDefaultTransaction,
} from '@tensor-foundation/test-helpers';
import {
  Condition,
  Mode,
  Operation,
  findWhitelistV2Pda,
  getCreateWhitelistV2Instruction,
  getUpdateWhitelistV2Instruction,
  operation,
} from '../src/index.js';

export const signAndSendTransaction = async (
  client: Client,
  transaction: CompilableTransaction & ITransactionWithBlockhashLifetime,
  commitment: Commitment = 'confirmed'
) => {
  const signedTransaction = await signTransactionWithSigners(transaction);
  const signature = getSignatureFromTransaction(signedTransaction);
  await sendAndConfirmTransactionFactory(client)(signedTransaction, {
    commitment,
    // skipPreflight: true,
  });

  return signature;
};

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
  payer?: KeyPairSigner;
  updateAuthority: KeyPairSigner;
  namespace?: KeyPairSigner;
  freezeAuthority?: Address;
  conditions?: Condition[];
}

export interface CreateWhitelistThrowsParams extends CreateWhitelistParams {
  t: ExecutionContext;
  code: number;
}

export interface CreateWhitelistReturns {
  whitelist: Address;
  uuid: Uint8Array;
  conditions: Condition[];
}

export async function createWhitelist({
  client,
  updateAuthority,
  payer = updateAuthority,
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
    payer,
    updateAuthority,
    namespace,
    whitelist,
    freezeAuthority,
    conditions,
    uuid,
  });

  await pipe(
    await createDefaultTransaction(client, payer.address),
    (tx) => appendTransactionInstruction(createWhitelistIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  return { whitelist, uuid, conditions };
}

export async function createWhitelistThrows({
  client,
  updateAuthority,
  payer = updateAuthority,
  namespace,
  freezeAuthority = DEFAULT_PUBKEY,
  conditions = [{ mode: Mode.FVC, value: updateAuthority.address }],
  t,
  code,
}: CreateWhitelistThrowsParams): Promise<void> {
  const uuid = generateUuid();
  namespace = namespace || (await generateKeyPairSigner());

  const [whitelist] = await findWhitelistV2Pda({
    namespace: namespace.address,
    uuid,
  });

  const createWhitelistIx = getCreateWhitelistV2Instruction({
    payer,
    updateAuthority,
    namespace,
    whitelist,
    freezeAuthority,
    conditions,
    uuid,
  });

  const promise = pipe(
    await createDefaultTransaction(client, payer.address),
    (tx) => appendTransactionInstruction(createWhitelistIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  const error = await t.throwsAsync<Error & { data: { logs: string[] } }>(
    promise
  );

  if (isSolanaError(error.cause, SOLANA_ERROR__INSTRUCTION_ERROR__CUSTOM)) {
    t.assert(error.cause.context.code === code);
  } else {
    // Expected a custom error, but didn't get one.
    t.assert(false);
  }
}

export interface UpdateWhitelistParams {
  client: Client;
  whitelist: Address;
  updateAuthority: KeyPairSigner;
  payer?: KeyPairSigner;
  newUpdateAuthority?: KeyPairSigner;
  newFreezeAuthority?: Operation;
  newConditions?: Condition[];
}

export interface UpdateWhitelistThrowsParams extends UpdateWhitelistParams {
  t: ExecutionContext;
  code: number;
}

export async function updateWhitelist({
  client,
  whitelist,
  updateAuthority,
  payer = updateAuthority,
  newUpdateAuthority,
  newFreezeAuthority,
  newConditions,
}: UpdateWhitelistParams) {
  const updateWhitelistIx = getUpdateWhitelistV2Instruction({
    payer,
    updateAuthority,
    whitelist,
    newUpdateAuthority,
    freezeAuthority: newFreezeAuthority ?? operation('Noop'),
    conditions: newConditions ?? none(),
  });

  await pipe(
    await createDefaultTransaction(client, payer.address),
    (tx) => appendTransactionInstruction(updateWhitelistIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );
}

export async function updateWhitelistThrows({
  client,
  whitelist,
  updateAuthority,
  payer = updateAuthority,
  newUpdateAuthority,
  newFreezeAuthority,
  newConditions,
  t,
  code,
}: UpdateWhitelistThrowsParams) {
  const updateWhitelistIx = getUpdateWhitelistV2Instruction({
    payer,
    updateAuthority,
    whitelist,
    newUpdateAuthority,
    freezeAuthority: newFreezeAuthority ?? operation('Noop'),
    conditions: newConditions ?? none(),
  });

  const promise = pipe(
    await createDefaultTransaction(client, payer.address),
    (tx) => appendTransactionInstruction(updateWhitelistIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  const error = await t.throwsAsync<Error & { data: { logs: string[] } }>(
    promise
  );

  if (isSolanaError(error.cause, SOLANA_ERROR__INSTRUCTION_ERROR__CUSTOM)) {
    t.assert(error.cause.context.code === code);
  } else {
    // Expected a custom error, but didn't get one.
    t.assert(false);
  }
}

export async function getAccountDataLength(
  client: Client,
  accountAddress: Address
): Promise<number> {
  const account = await client.rpc
    .getAccountInfo(accountAddress, { encoding: 'base64' })
    .send();

  const base64Data = account?.value?.data[0];

  const decodedData = base64Data
    ? Buffer.from(base64Data, 'base64')
    : undefined;

  const originalAccountSize = decodedData?.length ?? 0;

  return originalAccountSize;
}
