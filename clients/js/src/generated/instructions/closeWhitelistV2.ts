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
  type ReadonlySignerAccount,
  type ReadonlyUint8Array,
  type TransactionSigner,
  type WritableAccount,
} from '@solana/web3.js';
import { TENSOR_WHITELIST_PROGRAM_ADDRESS } from '../programs';
import { getAccountMetaFactory, type ResolvedAccount } from '../shared';

export const CLOSE_WHITELIST_V2_DISCRIMINATOR = new Uint8Array([
  31, 252, 108, 164, 179, 106, 57, 190,
]);

export function getCloseWhitelistV2DiscriminatorBytes() {
  return fixEncoderSize(getBytesEncoder(), 8).encode(
    CLOSE_WHITELIST_V2_DISCRIMINATOR
  );
}

export type CloseWhitelistV2Instruction<
  TProgram extends string = typeof TENSOR_WHITELIST_PROGRAM_ADDRESS,
  TAccountRentDestination extends string | IAccountMeta<string> = string,
  TAccountUpdateAuthority extends string | IAccountMeta<string> = string,
  TAccountWhitelist extends string | IAccountMeta<string> = string,
  TAccountSystemProgram extends
    | string
    | IAccountMeta<string> = '11111111111111111111111111111111',
  TRemainingAccounts extends readonly IAccountMeta<string>[] = [],
> = IInstruction<TProgram> &
  IInstructionWithData<Uint8Array> &
  IInstructionWithAccounts<
    [
      TAccountRentDestination extends string
        ? WritableAccount<TAccountRentDestination>
        : TAccountRentDestination,
      TAccountUpdateAuthority extends string
        ? ReadonlySignerAccount<TAccountUpdateAuthority> &
            IAccountSignerMeta<TAccountUpdateAuthority>
        : TAccountUpdateAuthority,
      TAccountWhitelist extends string
        ? WritableAccount<TAccountWhitelist>
        : TAccountWhitelist,
      TAccountSystemProgram extends string
        ? ReadonlyAccount<TAccountSystemProgram>
        : TAccountSystemProgram,
      ...TRemainingAccounts,
    ]
  >;

export type CloseWhitelistV2InstructionData = {
  discriminator: ReadonlyUint8Array;
};

export type CloseWhitelistV2InstructionDataArgs = {};

export function getCloseWhitelistV2InstructionDataEncoder(): Encoder<CloseWhitelistV2InstructionDataArgs> {
  return transformEncoder(
    getStructEncoder([['discriminator', fixEncoderSize(getBytesEncoder(), 8)]]),
    (value) => ({ ...value, discriminator: CLOSE_WHITELIST_V2_DISCRIMINATOR })
  );
}

export function getCloseWhitelistV2InstructionDataDecoder(): Decoder<CloseWhitelistV2InstructionData> {
  return getStructDecoder([
    ['discriminator', fixDecoderSize(getBytesDecoder(), 8)],
  ]);
}

export function getCloseWhitelistV2InstructionDataCodec(): Codec<
  CloseWhitelistV2InstructionDataArgs,
  CloseWhitelistV2InstructionData
> {
  return combineCodec(
    getCloseWhitelistV2InstructionDataEncoder(),
    getCloseWhitelistV2InstructionDataDecoder()
  );
}

export type CloseWhitelistV2Input<
  TAccountRentDestination extends string = string,
  TAccountUpdateAuthority extends string = string,
  TAccountWhitelist extends string = string,
  TAccountSystemProgram extends string = string,
> = {
  /** The rent payer. */
  rentDestination: Address<TAccountRentDestination>;
  /** The authority that will be allowed to update the whitelist. */
  updateAuthority: TransactionSigner<TAccountUpdateAuthority>;
  /** The whitelist PDA. */
  whitelist: Address<TAccountWhitelist>;
  systemProgram?: Address<TAccountSystemProgram>;
};

export function getCloseWhitelistV2Instruction<
  TAccountRentDestination extends string,
  TAccountUpdateAuthority extends string,
  TAccountWhitelist extends string,
  TAccountSystemProgram extends string,
  TProgramAddress extends Address = typeof TENSOR_WHITELIST_PROGRAM_ADDRESS,
>(
  input: CloseWhitelistV2Input<
    TAccountRentDestination,
    TAccountUpdateAuthority,
    TAccountWhitelist,
    TAccountSystemProgram
  >,
  config?: { programAddress?: TProgramAddress }
): CloseWhitelistV2Instruction<
  TProgramAddress,
  TAccountRentDestination,
  TAccountUpdateAuthority,
  TAccountWhitelist,
  TAccountSystemProgram
> {
  // Program address.
  const programAddress =
    config?.programAddress ?? TENSOR_WHITELIST_PROGRAM_ADDRESS;

  // Original accounts.
  const originalAccounts = {
    rentDestination: { value: input.rentDestination ?? null, isWritable: true },
    updateAuthority: {
      value: input.updateAuthority ?? null,
      isWritable: false,
    },
    whitelist: { value: input.whitelist ?? null, isWritable: true },
    systemProgram: { value: input.systemProgram ?? null, isWritable: false },
  };
  const accounts = originalAccounts as Record<
    keyof typeof originalAccounts,
    ResolvedAccount
  >;

  // Resolve default values.
  if (!accounts.systemProgram.value) {
    accounts.systemProgram.value =
      '11111111111111111111111111111111' as Address<'11111111111111111111111111111111'>;
  }

  const getAccountMeta = getAccountMetaFactory(programAddress, 'programId');
  const instruction = {
    accounts: [
      getAccountMeta(accounts.rentDestination),
      getAccountMeta(accounts.updateAuthority),
      getAccountMeta(accounts.whitelist),
      getAccountMeta(accounts.systemProgram),
    ],
    programAddress,
    data: getCloseWhitelistV2InstructionDataEncoder().encode({}),
  } as CloseWhitelistV2Instruction<
    TProgramAddress,
    TAccountRentDestination,
    TAccountUpdateAuthority,
    TAccountWhitelist,
    TAccountSystemProgram
  >;

  return instruction;
}

export type ParsedCloseWhitelistV2Instruction<
  TProgram extends string = typeof TENSOR_WHITELIST_PROGRAM_ADDRESS,
  TAccountMetas extends readonly IAccountMeta[] = readonly IAccountMeta[],
> = {
  programAddress: Address<TProgram>;
  accounts: {
    /** The rent payer. */
    rentDestination: TAccountMetas[0];
    /** The authority that will be allowed to update the whitelist. */
    updateAuthority: TAccountMetas[1];
    /** The whitelist PDA. */
    whitelist: TAccountMetas[2];
    systemProgram: TAccountMetas[3];
  };
  data: CloseWhitelistV2InstructionData;
};

export function parseCloseWhitelistV2Instruction<
  TProgram extends string,
  TAccountMetas extends readonly IAccountMeta[],
>(
  instruction: IInstruction<TProgram> &
    IInstructionWithAccounts<TAccountMetas> &
    IInstructionWithData<Uint8Array>
): ParsedCloseWhitelistV2Instruction<TProgram, TAccountMetas> {
  if (instruction.accounts.length < 4) {
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
      rentDestination: getNextAccount(),
      updateAuthority: getNextAccount(),
      whitelist: getNextAccount(),
      systemProgram: getNextAccount(),
    },
    data: getCloseWhitelistV2InstructionDataDecoder().decode(instruction.data),
  };
}
