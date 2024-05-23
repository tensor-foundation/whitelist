/**
 * This code was AUTOGENERATED using the kinobi library.
 * Please DO NOT EDIT THIS FILE, instead use visitors
 * to add features, then rerun kinobi to update it.
 *
 * @see https://github.com/kinobi-so/kinobi
 */

import {
  Address,
  Codec,
  Decoder,
  Encoder,
  IAccountMeta,
  IAccountSignerMeta,
  IInstruction,
  IInstructionWithAccounts,
  IInstructionWithData,
  ReadonlyAccount,
  ReadonlyUint8Array,
  TransactionSigner,
  WritableAccount,
  WritableSignerAccount,
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
} from '@solana/web3.js';
import { findMintProofPda } from '../pdas';
import { TENSOR_WHITELIST_PROGRAM_ADDRESS } from '../programs';
import {
  ResolvedAccount,
  expectAddress,
  getAccountMetaFactory,
} from '../shared';

export type CreateMintProofV2Instruction<
  TProgram extends string = typeof TENSOR_WHITELIST_PROGRAM_ADDRESS,
  TAccountPayer extends string | IAccountMeta<string> = string,
  TAccountMint extends string | IAccountMeta<string> = string,
  TAccountWhitelist extends string | IAccountMeta<string> = string,
  TAccountMintProof extends string | IAccountMeta<string> = string,
  TAccountSystemProgram extends
    | string
    | IAccountMeta<string> = '11111111111111111111111111111111',
  TRemainingAccounts extends readonly IAccountMeta<string>[] = [],
> = IInstruction<TProgram> &
  IInstructionWithData<Uint8Array> &
  IInstructionWithAccounts<
    [
      TAccountPayer extends string
        ? WritableSignerAccount<TAccountPayer> &
            IAccountSignerMeta<TAccountPayer>
        : TAccountPayer,
      TAccountMint extends string
        ? ReadonlyAccount<TAccountMint>
        : TAccountMint,
      TAccountWhitelist extends string
        ? ReadonlyAccount<TAccountWhitelist>
        : TAccountWhitelist,
      TAccountMintProof extends string
        ? WritableAccount<TAccountMintProof>
        : TAccountMintProof,
      TAccountSystemProgram extends string
        ? ReadonlyAccount<TAccountSystemProgram>
        : TAccountSystemProgram,
      ...TRemainingAccounts,
    ]
  >;

export type CreateMintProofV2InstructionData = {
  discriminator: ReadonlyUint8Array;
  proof: Array<ReadonlyUint8Array>;
};

export type CreateMintProofV2InstructionDataArgs = {
  proof: Array<ReadonlyUint8Array>;
};

export function getCreateMintProofV2InstructionDataEncoder(): Encoder<CreateMintProofV2InstructionDataArgs> {
  return transformEncoder(
    getStructEncoder([
      ['discriminator', fixEncoderSize(getBytesEncoder(), 8)],
      ['proof', getArrayEncoder(fixEncoderSize(getBytesEncoder(), 32))],
    ]),
    (value) => ({
      ...value,
      discriminator: new Uint8Array([219, 176, 21, 37, 145, 89, 154, 53]),
    })
  );
}

export function getCreateMintProofV2InstructionDataDecoder(): Decoder<CreateMintProofV2InstructionData> {
  return getStructDecoder([
    ['discriminator', fixDecoderSize(getBytesDecoder(), 8)],
    ['proof', getArrayDecoder(fixDecoderSize(getBytesDecoder(), 32))],
  ]);
}

export function getCreateMintProofV2InstructionDataCodec(): Codec<
  CreateMintProofV2InstructionDataArgs,
  CreateMintProofV2InstructionData
> {
  return combineCodec(
    getCreateMintProofV2InstructionDataEncoder(),
    getCreateMintProofV2InstructionDataDecoder()
  );
}

export type CreateMintProofV2AsyncInput<
  TAccountPayer extends string = string,
  TAccountMint extends string = string,
  TAccountWhitelist extends string = string,
  TAccountMintProof extends string = string,
  TAccountSystemProgram extends string = string,
> = {
  payer: TransactionSigner<TAccountPayer>;
  mint: Address<TAccountMint>;
  whitelist: Address<TAccountWhitelist>;
  mintProof?: Address<TAccountMintProof>;
  systemProgram?: Address<TAccountSystemProgram>;
  proof: CreateMintProofV2InstructionDataArgs['proof'];
};

export async function getCreateMintProofV2InstructionAsync<
  TAccountPayer extends string,
  TAccountMint extends string,
  TAccountWhitelist extends string,
  TAccountMintProof extends string,
  TAccountSystemProgram extends string,
>(
  input: CreateMintProofV2AsyncInput<
    TAccountPayer,
    TAccountMint,
    TAccountWhitelist,
    TAccountMintProof,
    TAccountSystemProgram
  >
): Promise<
  CreateMintProofV2Instruction<
    typeof TENSOR_WHITELIST_PROGRAM_ADDRESS,
    TAccountPayer,
    TAccountMint,
    TAccountWhitelist,
    TAccountMintProof,
    TAccountSystemProgram
  >
> {
  // Program address.
  const programAddress = TENSOR_WHITELIST_PROGRAM_ADDRESS;

  // Original accounts.
  const originalAccounts = {
    payer: { value: input.payer ?? null, isWritable: true },
    mint: { value: input.mint ?? null, isWritable: false },
    whitelist: { value: input.whitelist ?? null, isWritable: false },
    mintProof: { value: input.mintProof ?? null, isWritable: true },
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
      getAccountMeta(accounts.payer),
      getAccountMeta(accounts.mint),
      getAccountMeta(accounts.whitelist),
      getAccountMeta(accounts.mintProof),
      getAccountMeta(accounts.systemProgram),
    ],
    programAddress,
    data: getCreateMintProofV2InstructionDataEncoder().encode(
      args as CreateMintProofV2InstructionDataArgs
    ),
  } as CreateMintProofV2Instruction<
    typeof TENSOR_WHITELIST_PROGRAM_ADDRESS,
    TAccountPayer,
    TAccountMint,
    TAccountWhitelist,
    TAccountMintProof,
    TAccountSystemProgram
  >;

  return instruction;
}

export type CreateMintProofV2Input<
  TAccountPayer extends string = string,
  TAccountMint extends string = string,
  TAccountWhitelist extends string = string,
  TAccountMintProof extends string = string,
  TAccountSystemProgram extends string = string,
> = {
  payer: TransactionSigner<TAccountPayer>;
  mint: Address<TAccountMint>;
  whitelist: Address<TAccountWhitelist>;
  mintProof: Address<TAccountMintProof>;
  systemProgram?: Address<TAccountSystemProgram>;
  proof: CreateMintProofV2InstructionDataArgs['proof'];
};

export function getCreateMintProofV2Instruction<
  TAccountPayer extends string,
  TAccountMint extends string,
  TAccountWhitelist extends string,
  TAccountMintProof extends string,
  TAccountSystemProgram extends string,
>(
  input: CreateMintProofV2Input<
    TAccountPayer,
    TAccountMint,
    TAccountWhitelist,
    TAccountMintProof,
    TAccountSystemProgram
  >
): CreateMintProofV2Instruction<
  typeof TENSOR_WHITELIST_PROGRAM_ADDRESS,
  TAccountPayer,
  TAccountMint,
  TAccountWhitelist,
  TAccountMintProof,
  TAccountSystemProgram
> {
  // Program address.
  const programAddress = TENSOR_WHITELIST_PROGRAM_ADDRESS;

  // Original accounts.
  const originalAccounts = {
    payer: { value: input.payer ?? null, isWritable: true },
    mint: { value: input.mint ?? null, isWritable: false },
    whitelist: { value: input.whitelist ?? null, isWritable: false },
    mintProof: { value: input.mintProof ?? null, isWritable: true },
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
      getAccountMeta(accounts.payer),
      getAccountMeta(accounts.mint),
      getAccountMeta(accounts.whitelist),
      getAccountMeta(accounts.mintProof),
      getAccountMeta(accounts.systemProgram),
    ],
    programAddress,
    data: getCreateMintProofV2InstructionDataEncoder().encode(
      args as CreateMintProofV2InstructionDataArgs
    ),
  } as CreateMintProofV2Instruction<
    typeof TENSOR_WHITELIST_PROGRAM_ADDRESS,
    TAccountPayer,
    TAccountMint,
    TAccountWhitelist,
    TAccountMintProof,
    TAccountSystemProgram
  >;

  return instruction;
}

export type ParsedCreateMintProofV2Instruction<
  TProgram extends string = typeof TENSOR_WHITELIST_PROGRAM_ADDRESS,
  TAccountMetas extends readonly IAccountMeta[] = readonly IAccountMeta[],
> = {
  programAddress: Address<TProgram>;
  accounts: {
    payer: TAccountMetas[0];
    mint: TAccountMetas[1];
    whitelist: TAccountMetas[2];
    mintProof: TAccountMetas[3];
    systemProgram: TAccountMetas[4];
  };
  data: CreateMintProofV2InstructionData;
};

export function parseCreateMintProofV2Instruction<
  TProgram extends string,
  TAccountMetas extends readonly IAccountMeta[],
>(
  instruction: IInstruction<TProgram> &
    IInstructionWithAccounts<TAccountMetas> &
    IInstructionWithData<Uint8Array>
): ParsedCreateMintProofV2Instruction<TProgram, TAccountMetas> {
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
      payer: getNextAccount(),
      mint: getNextAccount(),
      whitelist: getNextAccount(),
      mintProof: getNextAccount(),
      systemProgram: getNextAccount(),
    },
    data: getCreateMintProofV2InstructionDataDecoder().decode(instruction.data),
  };
}
