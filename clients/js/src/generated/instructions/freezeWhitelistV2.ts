/**
 * This code was AUTOGENERATED using the kinobi library.
 * Please DO NOT EDIT THIS FILE, instead use visitors
 * to add features, then rerun kinobi to update it.
 *
 * @see https://github.com/metaplex-foundation/kinobi
 */

import { Address } from '@solana/addresses';
import {
  Codec,
  Decoder,
  Encoder,
  combineCodec,
  mapEncoder,
} from '@solana/codecs-core';
import {
  getArrayDecoder,
  getArrayEncoder,
  getStructDecoder,
  getStructEncoder,
} from '@solana/codecs-data-structures';
import { getU8Decoder, getU8Encoder } from '@solana/codecs-numbers';
import {
  AccountRole,
  IAccountMeta,
  IInstruction,
  IInstructionWithAccounts,
  IInstructionWithData,
  ReadonlySignerAccount,
  WritableAccount,
} from '@solana/instructions';
import { IAccountSignerMeta, TransactionSigner } from '@solana/signers';
import {
  ResolvedAccount,
  accountMetaWithDefault,
  getAccountMetasWithSigners,
} from '../shared';

export type FreezeWhitelistV2Instruction<
  TProgram extends string = 'TL1ST2iRBzuGTqLn1KXnGdSnEow62BzPnGiqyRXhWtW',
  TAccountFreezeAuthority extends string | IAccountMeta<string> = string,
  TAccountWhitelist extends string | IAccountMeta<string> = string,
  TRemainingAccounts extends Array<IAccountMeta<string>> = []
> = IInstruction<TProgram> &
  IInstructionWithData<Uint8Array> &
  IInstructionWithAccounts<
    [
      TAccountFreezeAuthority extends string
        ? ReadonlySignerAccount<TAccountFreezeAuthority>
        : TAccountFreezeAuthority,
      TAccountWhitelist extends string
        ? WritableAccount<TAccountWhitelist>
        : TAccountWhitelist,
      ...TRemainingAccounts
    ]
  >;

export type FreezeWhitelistV2InstructionWithSigners<
  TProgram extends string = 'TL1ST2iRBzuGTqLn1KXnGdSnEow62BzPnGiqyRXhWtW',
  TAccountFreezeAuthority extends string | IAccountMeta<string> = string,
  TAccountWhitelist extends string | IAccountMeta<string> = string,
  TRemainingAccounts extends Array<IAccountMeta<string>> = []
> = IInstruction<TProgram> &
  IInstructionWithData<Uint8Array> &
  IInstructionWithAccounts<
    [
      TAccountFreezeAuthority extends string
        ? ReadonlySignerAccount<TAccountFreezeAuthority> &
            IAccountSignerMeta<TAccountFreezeAuthority>
        : TAccountFreezeAuthority,
      TAccountWhitelist extends string
        ? WritableAccount<TAccountWhitelist>
        : TAccountWhitelist,
      ...TRemainingAccounts
    ]
  >;

export type FreezeWhitelistV2InstructionData = { discriminator: Array<number> };

export type FreezeWhitelistV2InstructionDataArgs = {};

export function getFreezeWhitelistV2InstructionDataEncoder() {
  return mapEncoder(
    getStructEncoder<{ discriminator: Array<number> }>([
      ['discriminator', getArrayEncoder(getU8Encoder(), { size: 8 })],
    ]),
    (value) => ({
      ...value,
      discriminator: [69, 158, 243, 78, 116, 68, 221, 113],
    })
  ) satisfies Encoder<FreezeWhitelistV2InstructionDataArgs>;
}

export function getFreezeWhitelistV2InstructionDataDecoder() {
  return getStructDecoder<FreezeWhitelistV2InstructionData>([
    ['discriminator', getArrayDecoder(getU8Decoder(), { size: 8 })],
  ]) satisfies Decoder<FreezeWhitelistV2InstructionData>;
}

export function getFreezeWhitelistV2InstructionDataCodec(): Codec<
  FreezeWhitelistV2InstructionDataArgs,
  FreezeWhitelistV2InstructionData
> {
  return combineCodec(
    getFreezeWhitelistV2InstructionDataEncoder(),
    getFreezeWhitelistV2InstructionDataDecoder()
  );
}

export type FreezeWhitelistV2Input<
  TAccountFreezeAuthority extends string,
  TAccountWhitelist extends string
> = {
  freezeAuthority: Address<TAccountFreezeAuthority>;
  whitelist: Address<TAccountWhitelist>;
};

export type FreezeWhitelistV2InputWithSigners<
  TAccountFreezeAuthority extends string,
  TAccountWhitelist extends string
> = {
  freezeAuthority: TransactionSigner<TAccountFreezeAuthority>;
  whitelist: Address<TAccountWhitelist>;
};

export function getFreezeWhitelistV2Instruction<
  TAccountFreezeAuthority extends string,
  TAccountWhitelist extends string,
  TProgram extends string = 'TL1ST2iRBzuGTqLn1KXnGdSnEow62BzPnGiqyRXhWtW'
>(
  input: FreezeWhitelistV2InputWithSigners<
    TAccountFreezeAuthority,
    TAccountWhitelist
  >
): FreezeWhitelistV2InstructionWithSigners<
  TProgram,
  TAccountFreezeAuthority,
  TAccountWhitelist
>;
export function getFreezeWhitelistV2Instruction<
  TAccountFreezeAuthority extends string,
  TAccountWhitelist extends string,
  TProgram extends string = 'TL1ST2iRBzuGTqLn1KXnGdSnEow62BzPnGiqyRXhWtW'
>(
  input: FreezeWhitelistV2Input<TAccountFreezeAuthority, TAccountWhitelist>
): FreezeWhitelistV2Instruction<
  TProgram,
  TAccountFreezeAuthority,
  TAccountWhitelist
>;
export function getFreezeWhitelistV2Instruction<
  TAccountFreezeAuthority extends string,
  TAccountWhitelist extends string,
  TProgram extends string = 'TL1ST2iRBzuGTqLn1KXnGdSnEow62BzPnGiqyRXhWtW'
>(
  input: FreezeWhitelistV2Input<TAccountFreezeAuthority, TAccountWhitelist>
): IInstruction {
  // Program address.
  const programAddress =
    'TL1ST2iRBzuGTqLn1KXnGdSnEow62BzPnGiqyRXhWtW' as Address<'TL1ST2iRBzuGTqLn1KXnGdSnEow62BzPnGiqyRXhWtW'>;

  // Original accounts.
  type AccountMetas = Parameters<
    typeof getFreezeWhitelistV2InstructionRaw<
      TProgram,
      TAccountFreezeAuthority,
      TAccountWhitelist
    >
  >[0];
  const accounts: Record<keyof AccountMetas, ResolvedAccount> = {
    freezeAuthority: {
      value: input.freezeAuthority ?? null,
      isWritable: false,
    },
    whitelist: { value: input.whitelist ?? null, isWritable: true },
  };

  // Get account metas and signers.
  const accountMetas = getAccountMetasWithSigners(
    accounts,
    'programId',
    programAddress
  );

  const instruction = getFreezeWhitelistV2InstructionRaw(
    accountMetas as Record<keyof AccountMetas, IAccountMeta>,
    programAddress
  );

  return instruction;
}

export function getFreezeWhitelistV2InstructionRaw<
  TProgram extends string = 'TL1ST2iRBzuGTqLn1KXnGdSnEow62BzPnGiqyRXhWtW',
  TAccountFreezeAuthority extends string | IAccountMeta<string> = string,
  TAccountWhitelist extends string | IAccountMeta<string> = string,
  TRemainingAccounts extends Array<IAccountMeta<string>> = []
>(
  accounts: {
    freezeAuthority: TAccountFreezeAuthority extends string
      ? Address<TAccountFreezeAuthority>
      : TAccountFreezeAuthority;
    whitelist: TAccountWhitelist extends string
      ? Address<TAccountWhitelist>
      : TAccountWhitelist;
  },
  programAddress: Address<TProgram> = 'TL1ST2iRBzuGTqLn1KXnGdSnEow62BzPnGiqyRXhWtW' as Address<TProgram>,
  remainingAccounts?: TRemainingAccounts
) {
  return {
    accounts: [
      accountMetaWithDefault(
        accounts.freezeAuthority,
        AccountRole.READONLY_SIGNER
      ),
      accountMetaWithDefault(accounts.whitelist, AccountRole.WRITABLE),
      ...(remainingAccounts ?? []),
    ],
    data: getFreezeWhitelistV2InstructionDataEncoder().encode({}),
    programAddress,
  } as FreezeWhitelistV2Instruction<
    TProgram,
    TAccountFreezeAuthority,
    TAccountWhitelist,
    TRemainingAccounts
  >;
}

export type ParsedFreezeWhitelistV2Instruction<
  TProgram extends string = 'TL1ST2iRBzuGTqLn1KXnGdSnEow62BzPnGiqyRXhWtW',
  TAccountMetas extends readonly IAccountMeta[] = readonly IAccountMeta[]
> = {
  programAddress: Address<TProgram>;
  accounts: {
    freezeAuthority: TAccountMetas[0];
    whitelist: TAccountMetas[1];
  };
  data: FreezeWhitelistV2InstructionData;
};

export function parseFreezeWhitelistV2Instruction<
  TProgram extends string,
  TAccountMetas extends readonly IAccountMeta[]
>(
  instruction: IInstruction<TProgram> &
    IInstructionWithAccounts<TAccountMetas> &
    IInstructionWithData<Uint8Array>
): ParsedFreezeWhitelistV2Instruction<TProgram, TAccountMetas> {
  if (instruction.accounts.length < 2) {
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
      freezeAuthority: getNextAccount(),
      whitelist: getNextAccount(),
    },
    data: getFreezeWhitelistV2InstructionDataDecoder().decode(instruction.data),
  };
}