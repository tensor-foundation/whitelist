/**
 * This code was AUTOGENERATED using the codama library.
 * Please DO NOT EDIT THIS FILE, instead use visitors
 * to add features, then rerun codama to update it.
 *
 * @see https://github.com/codama-idl/codama
 */

import {
  combineCodec,
  fixDecoderSize,
  fixEncoderSize,
  getArrayDecoder,
  getArrayEncoder,
  getBytesDecoder,
  getBytesEncoder,
  getStructDecoder,
  getStructEncoder,
  transformEncoder,
  type Address,
  type Codec,
  type Decoder,
  type Encoder,
  type IAccountMeta,
  type IAccountSignerMeta,
  type IInstruction,
  type IInstructionWithAccounts,
  type IInstructionWithData,
  type ReadonlyAccount,
  type ReadonlyUint8Array,
  type TransactionSigner,
  type WritableAccount,
  type WritableSignerAccount,
} from '@solana/web3.js';
import { findMintProofPda } from '../pdas';
import { TENSOR_WHITELIST_PROGRAM_ADDRESS } from '../programs';
import {
  expectAddress,
  getAccountMetaFactory,
  type ResolvedAccount,
} from '../shared';

export const INIT_UPDATE_MINT_PROOF_DISCRIMINATOR = new Uint8Array([
  30, 77, 123, 9, 191, 37, 52, 159,
]);

export function getInitUpdateMintProofDiscriminatorBytes() {
  return fixEncoderSize(getBytesEncoder(), 8).encode(
    INIT_UPDATE_MINT_PROOF_DISCRIMINATOR
  );
}

export type InitUpdateMintProofInstruction<
  TProgram extends string = typeof TENSOR_WHITELIST_PROGRAM_ADDRESS,
  TAccountWhitelist extends string | IAccountMeta<string> = string,
  TAccountMint extends string | IAccountMeta<string> = string,
  TAccountMintProof extends string | IAccountMeta<string> = string,
  TAccountUser extends string | IAccountMeta<string> = string,
  TAccountSystemProgram extends
    | string
    | IAccountMeta<string> = '11111111111111111111111111111111',
  TRemainingAccounts extends readonly IAccountMeta<string>[] = [],
> = IInstruction<TProgram> &
  IInstructionWithData<Uint8Array> &
  IInstructionWithAccounts<
    [
      TAccountWhitelist extends string
        ? ReadonlyAccount<TAccountWhitelist>
        : TAccountWhitelist,
      TAccountMint extends string
        ? ReadonlyAccount<TAccountMint>
        : TAccountMint,
      TAccountMintProof extends string
        ? WritableAccount<TAccountMintProof>
        : TAccountMintProof,
      TAccountUser extends string
        ? WritableSignerAccount<TAccountUser> & IAccountSignerMeta<TAccountUser>
        : TAccountUser,
      TAccountSystemProgram extends string
        ? ReadonlyAccount<TAccountSystemProgram>
        : TAccountSystemProgram,
      ...TRemainingAccounts,
    ]
  >;

export type InitUpdateMintProofInstructionData = {
  discriminator: ReadonlyUint8Array;
  proof: Array<ReadonlyUint8Array>;
};

export type InitUpdateMintProofInstructionDataArgs = {
  proof: Array<ReadonlyUint8Array>;
};

export function getInitUpdateMintProofInstructionDataEncoder(): Encoder<InitUpdateMintProofInstructionDataArgs> {
  return transformEncoder(
    getStructEncoder([
      ['discriminator', fixEncoderSize(getBytesEncoder(), 8)],
      ['proof', getArrayEncoder(fixEncoderSize(getBytesEncoder(), 32))],
    ]),
    (value) => ({
      ...value,
      discriminator: INIT_UPDATE_MINT_PROOF_DISCRIMINATOR,
    })
  );
}

export function getInitUpdateMintProofInstructionDataDecoder(): Decoder<InitUpdateMintProofInstructionData> {
  return getStructDecoder([
    ['discriminator', fixDecoderSize(getBytesDecoder(), 8)],
    ['proof', getArrayDecoder(fixDecoderSize(getBytesDecoder(), 32))],
  ]);
}

export function getInitUpdateMintProofInstructionDataCodec(): Codec<
  InitUpdateMintProofInstructionDataArgs,
  InitUpdateMintProofInstructionData
> {
  return combineCodec(
    getInitUpdateMintProofInstructionDataEncoder(),
    getInitUpdateMintProofInstructionDataDecoder()
  );
}

export type InitUpdateMintProofAsyncInput<
  TAccountWhitelist extends string = string,
  TAccountMint extends string = string,
  TAccountMintProof extends string = string,
  TAccountUser extends string = string,
  TAccountSystemProgram extends string = string,
> = {
  whitelist: Address<TAccountWhitelist>;
  mint: Address<TAccountMint>;
  mintProof?: Address<TAccountMintProof>;
  user: TransactionSigner<TAccountUser>;
  systemProgram?: Address<TAccountSystemProgram>;
  proof: InitUpdateMintProofInstructionDataArgs['proof'];
};

export async function getInitUpdateMintProofInstructionAsync<
  TAccountWhitelist extends string,
  TAccountMint extends string,
  TAccountMintProof extends string,
  TAccountUser extends string,
  TAccountSystemProgram extends string,
  TProgramAddress extends Address = typeof TENSOR_WHITELIST_PROGRAM_ADDRESS,
>(
  input: InitUpdateMintProofAsyncInput<
    TAccountWhitelist,
    TAccountMint,
    TAccountMintProof,
    TAccountUser,
    TAccountSystemProgram
  >,
  config?: { programAddress?: TProgramAddress }
): Promise<
  InitUpdateMintProofInstruction<
    TProgramAddress,
    TAccountWhitelist,
    TAccountMint,
    TAccountMintProof,
    TAccountUser,
    TAccountSystemProgram
  >
> {
  // Program address.
  const programAddress =
    config?.programAddress ?? TENSOR_WHITELIST_PROGRAM_ADDRESS;

  // Original accounts.
  const originalAccounts = {
    whitelist: { value: input.whitelist ?? null, isWritable: false },
    mint: { value: input.mint ?? null, isWritable: false },
    mintProof: { value: input.mintProof ?? null, isWritable: true },
    user: { value: input.user ?? null, isWritable: true },
    systemProgram: { value: input.systemProgram ?? null, isWritable: false },
  };
  const accounts = originalAccounts as Record<
    keyof typeof originalAccounts,
    ResolvedAccount
  >;

  // Original args.
  const args = { ...input };

  // Resolve default values.
  if (!accounts.mintProof.value) {
    accounts.mintProof.value = await findMintProofPda({
      mint: expectAddress(accounts.mint.value),
      whitelist: expectAddress(accounts.whitelist.value),
    });
  }
  if (!accounts.systemProgram.value) {
    accounts.systemProgram.value =
      '11111111111111111111111111111111' as Address<'11111111111111111111111111111111'>;
  }

  const getAccountMeta = getAccountMetaFactory(programAddress, 'programId');
  const instruction = {
    accounts: [
      getAccountMeta(accounts.whitelist),
      getAccountMeta(accounts.mint),
      getAccountMeta(accounts.mintProof),
      getAccountMeta(accounts.user),
      getAccountMeta(accounts.systemProgram),
    ],
    programAddress,
    data: getInitUpdateMintProofInstructionDataEncoder().encode(
      args as InitUpdateMintProofInstructionDataArgs
    ),
  } as InitUpdateMintProofInstruction<
    TProgramAddress,
    TAccountWhitelist,
    TAccountMint,
    TAccountMintProof,
    TAccountUser,
    TAccountSystemProgram
  >;

  return instruction;
}

export type InitUpdateMintProofInput<
  TAccountWhitelist extends string = string,
  TAccountMint extends string = string,
  TAccountMintProof extends string = string,
  TAccountUser extends string = string,
  TAccountSystemProgram extends string = string,
> = {
  whitelist: Address<TAccountWhitelist>;
  mint: Address<TAccountMint>;
  mintProof: Address<TAccountMintProof>;
  user: TransactionSigner<TAccountUser>;
  systemProgram?: Address<TAccountSystemProgram>;
  proof: InitUpdateMintProofInstructionDataArgs['proof'];
};

export function getInitUpdateMintProofInstruction<
  TAccountWhitelist extends string,
  TAccountMint extends string,
  TAccountMintProof extends string,
  TAccountUser extends string,
  TAccountSystemProgram extends string,
  TProgramAddress extends Address = typeof TENSOR_WHITELIST_PROGRAM_ADDRESS,
>(
  input: InitUpdateMintProofInput<
    TAccountWhitelist,
    TAccountMint,
    TAccountMintProof,
    TAccountUser,
    TAccountSystemProgram
  >,
  config?: { programAddress?: TProgramAddress }
): InitUpdateMintProofInstruction<
  TProgramAddress,
  TAccountWhitelist,
  TAccountMint,
  TAccountMintProof,
  TAccountUser,
  TAccountSystemProgram
> {
  // Program address.
  const programAddress =
    config?.programAddress ?? TENSOR_WHITELIST_PROGRAM_ADDRESS;

  // Original accounts.
  const originalAccounts = {
    whitelist: { value: input.whitelist ?? null, isWritable: false },
    mint: { value: input.mint ?? null, isWritable: false },
    mintProof: { value: input.mintProof ?? null, isWritable: true },
    user: { value: input.user ?? null, isWritable: true },
    systemProgram: { value: input.systemProgram ?? null, isWritable: false },
  };
  const accounts = originalAccounts as Record<
    keyof typeof originalAccounts,
    ResolvedAccount
  >;

  // Original args.
  const args = { ...input };

  // Resolve default values.
  if (!accounts.systemProgram.value) {
    accounts.systemProgram.value =
      '11111111111111111111111111111111' as Address<'11111111111111111111111111111111'>;
  }

  const getAccountMeta = getAccountMetaFactory(programAddress, 'programId');
  const instruction = {
    accounts: [
      getAccountMeta(accounts.whitelist),
      getAccountMeta(accounts.mint),
      getAccountMeta(accounts.mintProof),
      getAccountMeta(accounts.user),
      getAccountMeta(accounts.systemProgram),
    ],
    programAddress,
    data: getInitUpdateMintProofInstructionDataEncoder().encode(
      args as InitUpdateMintProofInstructionDataArgs
    ),
  } as InitUpdateMintProofInstruction<
    TProgramAddress,
    TAccountWhitelist,
    TAccountMint,
    TAccountMintProof,
    TAccountUser,
    TAccountSystemProgram
  >;

  return instruction;
}

export type ParsedInitUpdateMintProofInstruction<
  TProgram extends string = typeof TENSOR_WHITELIST_PROGRAM_ADDRESS,
  TAccountMetas extends readonly IAccountMeta[] = readonly IAccountMeta[],
> = {
  programAddress: Address<TProgram>;
  accounts: {
    whitelist: TAccountMetas[0];
    mint: TAccountMetas[1];
    mintProof: TAccountMetas[2];
    user: TAccountMetas[3];
    systemProgram: TAccountMetas[4];
  };
  data: InitUpdateMintProofInstructionData;
};

export function parseInitUpdateMintProofInstruction<
  TProgram extends string,
  TAccountMetas extends readonly IAccountMeta[],
>(
  instruction: IInstruction<TProgram> &
    IInstructionWithAccounts<TAccountMetas> &
    IInstructionWithData<Uint8Array>
): ParsedInitUpdateMintProofInstruction<TProgram, TAccountMetas> {
  if (instruction.accounts.length < 5) {
    // TODO: Coded error.
    throw new Error('Not enough accounts');
  }
  let accountIndex = 0;
  const getNextAccount = () => {
    const accountMeta = instruction.accounts![accountIndex]!;
    accountIndex += 1;
    return accountMeta;
  };
  return {
    programAddress: instruction.programAddress,
    accounts: {
      whitelist: getNextAccount(),
      mint: getNextAccount(),
      mintProof: getNextAccount(),
      user: getNextAccount(),
      systemProgram: getNextAccount(),
    },
    data: getInitUpdateMintProofInstructionDataDecoder().decode(
      instruction.data
    ),
  };
}
