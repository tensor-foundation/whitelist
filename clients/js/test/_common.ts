import {
  Address,
  KeyPairSigner,
  SOLANA_ERROR__INSTRUCTION_ERROR__CUSTOM,
  address,
  appendTransactionMessageInstruction,
  generateKeyPairSigner,
  isSolanaError,
  none,
  pipe,
} from '@solana/web3.js';
import {
  Client,
  createDefaultTransaction,
  signAndSendTransaction,
} from '@tensor-foundation/test-helpers';
import { ExecutionContext } from 'ava';
import { v4 } from 'uuid';
import {
  Condition,
  Mode,
  Operation,
  findMintProofV2Pda,
  findWhitelistV2Pda,
  getCreateWhitelistV2Instruction,
  getInitUpdateMintProofV2InstructionAsync,
  getUpdateWhitelistV2Instruction,
  operation,
} from '../src/index.js';

export const MAX_PROOF_LENGTH = 28;

export const CURRENT_WHITELIST_VERSION = 1;

export const WHITELIST_V2_BASE_SIZE = 139;
export const WHITELIST_V2_CONDITION_SIZE = 33;
export const RUST_VEC_SIZE = 4;

export const DEFAULT_PUBKEY: Address = address(
  '11111111111111111111111111111111'
);

export const TRANSACTION_FEE = 5000n;

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
    await createDefaultTransaction(client, payer),
    (tx) => appendTransactionMessageInstruction(createWhitelistIx, tx),
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
    await createDefaultTransaction(client, payer),
    (tx) => appendTransactionMessageInstruction(createWhitelistIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  await expectCustomError(t, promise, code);
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
    await createDefaultTransaction(client, payer),
    (tx) => appendTransactionMessageInstruction(updateWhitelistIx, tx),
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
    await createDefaultTransaction(client, payer),
    (tx) => appendTransactionMessageInstruction(updateWhitelistIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  await expectCustomError(t, promise, code);
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

export interface initUpdateMintProofV2Params {
  client: Client;
  payer: KeyPairSigner;
  mint: Address;
  whitelist: Address;
  proof: Uint8Array[];
}

export interface initUpdateMintProofV2ThrowsParams
  extends initUpdateMintProofV2Params {
  t: ExecutionContext;
  code: BigInt | number;
}

export interface initUpdateMintProofV2Returns {
  mintProof: Address;
}

export async function upsertMintProof({
  client,
  payer,
  mint,
  whitelist,
  proof,
}: initUpdateMintProofV2Params): Promise<initUpdateMintProofV2Returns> {
  const [mintProof] = await findMintProofV2Pda({ mint, whitelist });

  const createMintProofIx = await getInitUpdateMintProofV2InstructionAsync({
    payer,
    mint,
    mintProof,
    whitelist,
    proof,
  });

  await pipe(
    await createDefaultTransaction(client, payer),
    (tx) => appendTransactionMessageInstruction(createMintProofIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  return { mintProof };
}

export async function createMintProofThrows({
  client,
  payer,
  mint,
  whitelist,
  proof,
  t,
  code,
}: initUpdateMintProofV2ThrowsParams) {
  const [mintProof] = await findMintProofV2Pda({ mint, whitelist });

  const createMintProofIx = await getInitUpdateMintProofV2InstructionAsync({
    payer,
    mint,
    mintProof,
    whitelist,
    proof,
  });

  const promise = pipe(
    await createDefaultTransaction(client, payer),
    (tx) => appendTransactionMessageInstruction(createMintProofIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  await expectCustomError(t, promise, code);
}

export const expectCustomError = async (
  t: ExecutionContext,
  promise: Promise<unknown>,
  code: BigInt | number
) => {
  const error = await t.throwsAsync<Error & { data: { logs: string[] } }>(
    promise
  );

  if (typeof code === 'bigint') {
    code = Number(code);
  }

  if (isSolanaError(error.cause, SOLANA_ERROR__INSTRUCTION_ERROR__CUSTOM)) {
    t.assert(
      error.cause.context.code === code,
      `expected error code ${code}, received ${error.cause.context.code}`
    );
  } else {
    t.fail("expected a custom error, but didn't get one");
  }
};
