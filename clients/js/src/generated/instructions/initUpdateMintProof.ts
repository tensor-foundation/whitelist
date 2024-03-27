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
  getArrayDecoder,
  getArrayEncoder,
  getBytesDecoder,
  getBytesEncoder,
  getStructDecoder,
  getStructEncoder,
  getU8Decoder,
  getU8Encoder,
  mapEncoder,
} from '@solana/codecs';
import {
  AccountRole,
  IAccountMeta,
  IInstruction,
  IInstructionWithAccounts,
  IInstructionWithData,
  ReadonlyAccount,
  WritableAccount,
  WritableSignerAccount,
} from '@solana/instructions';
import { IAccountSignerMeta, TransactionSigner } from '@solana/signers';
import { findMintProofPda } from '../pdas';
import {
  ResolvedAccount,
  accountMetaWithDefault,
  expectAddress,
  getAccountMetasWithSigners,
} from '../shared';

export type InitUpdateMintProofInstruction<
  TProgram extends string = 'TL1ST2iRBzuGTqLn1KXnGdSnEow62BzPnGiqyRXhWtW',
  TAccountWhitelist extends string | IAccountMeta<string> = string,
  TAccountMint extends string | IAccountMeta<string> = string,
  TAccountMintProof extends string | IAccountMeta<string> = string,
  TAccountUser extends string | IAccountMeta<string> = string,
  TAccountSystemProgram extends
    | string
    | IAccountMeta<string> = '11111111111111111111111111111111',
  TRemainingAccounts extends Array<IAccountMeta<string>> = [],
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
        ? WritableSignerAccount<TAccountUser>
        : TAccountUser,
      TAccountSystemProgram extends string
        ? ReadonlyAccount<TAccountSystemProgram>
        : TAccountSystemProgram,
      ...TRemainingAccounts,
    ]
  >;

export type InitUpdateMintProofInstructionWithSigners<
  TProgram extends string = 'TL1ST2iRBzuGTqLn1KXnGdSnEow62BzPnGiqyRXhWtW',
  TAccountWhitelist extends string | IAccountMeta<string> = string,
  TAccountMint extends string | IAccountMeta<string> = string,
  TAccountMintProof extends string | IAccountMeta<string> = string,
  TAccountUser extends string | IAccountMeta<string> = string,
  TAccountSystemProgram extends
    | string
    | IAccountMeta<string> = '11111111111111111111111111111111',
  TRemainingAccounts extends Array<IAccountMeta<string>> = [],
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
  discriminator: Array<number>;
  proof: Array<Uint8Array>;
};

export type InitUpdateMintProofInstructionDataArgs = {
  proof: Array<Uint8Array>;
};

export function getInitUpdateMintProofInstructionDataEncoder(): Encoder<InitUpdateMintProofInstructionDataArgs> {
  return mapEncoder(
    getStructEncoder([
      ['discriminator', getArrayEncoder(getU8Encoder(), { size: 8 })],
      ['proof', getArrayEncoder(getBytesEncoder({ size: 32 }))],
    ]),
    (value) => ({ ...value, discriminator: [30, 77, 123, 9, 191, 37, 52, 159] })
  );
}

export function getInitUpdateMintProofInstructionDataDecoder(): Decoder<InitUpdateMintProofInstructionData> {
  return getStructDecoder([
    ['discriminator', getArrayDecoder(getU8Decoder(), { size: 8 })],
    ['proof', getArrayDecoder(getBytesDecoder({ size: 32 }))],
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
  TAccountWhitelist extends string,
  TAccountMint extends string,
  TAccountMintProof extends string,
  TAccountUser extends string,
  TAccountSystemProgram extends string,
> = {
  whitelist: Address<TAccountWhitelist>;
  mint: Address<TAccountMint>;
  mintProof?: Address<TAccountMintProof>;
  user: Address<TAccountUser>;
  systemProgram?: Address<TAccountSystemProgram>;
  proof: InitUpdateMintProofInstructionDataArgs['proof'];
};

export type InitUpdateMintProofAsyncInputWithSigners<
  TAccountWhitelist extends string,
  TAccountMint extends string,
  TAccountMintProof extends string,
  TAccountUser extends string,
  TAccountSystemProgram extends string,
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
  TProgram extends string = 'TL1ST2iRBzuGTqLn1KXnGdSnEow62BzPnGiqyRXhWtW',
>(
  input: InitUpdateMintProofAsyncInputWithSigners<
    TAccountWhitelist,
    TAccountMint,
    TAccountMintProof,
    TAccountUser,
    TAccountSystemProgram
  >
): Promise<
  InitUpdateMintProofInstructionWithSigners<
    TProgram,
    TAccountWhitelist,
    TAccountMint,
    TAccountMintProof,
    TAccountUser,
    TAccountSystemProgram
  >
>;
export async function getInitUpdateMintProofInstructionAsync<
  TAccountWhitelist extends string,
  TAccountMint extends string,
  TAccountMintProof extends string,
  TAccountUser extends string,
  TAccountSystemProgram extends string,
  TProgram extends string = 'TL1ST2iRBzuGTqLn1KXnGdSnEow62BzPnGiqyRXhWtW',
>(
  input: InitUpdateMintProofAsyncInput<
    TAccountWhitelist,
    TAccountMint,
    TAccountMintProof,
    TAccountUser,
    TAccountSystemProgram
  >
): Promise<
  InitUpdateMintProofInstruction<
    TProgram,
    TAccountWhitelist,
    TAccountMint,
    TAccountMintProof,
    TAccountUser,
    TAccountSystemProgram
  >
>;
export async function getInitUpdateMintProofInstructionAsync<
  TAccountWhitelist extends string,
  TAccountMint extends string,
  TAccountMintProof extends string,
  TAccountUser extends string,
  TAccountSystemProgram extends string,
  TProgram extends string = 'TL1ST2iRBzuGTqLn1KXnGdSnEow62BzPnGiqyRXhWtW',
>(
  input: InitUpdateMintProofAsyncInput<
    TAccountWhitelist,
    TAccountMint,
    TAccountMintProof,
    TAccountUser,
    TAccountSystemProgram
  >
): Promise<IInstruction> {
  // Program address.
  const programAddress =
    'TL1ST2iRBzuGTqLn1KXnGdSnEow62BzPnGiqyRXhWtW' as Address<'TL1ST2iRBzuGTqLn1KXnGdSnEow62BzPnGiqyRXhWtW'>;

  // Original accounts.
  type AccountMetas = Parameters<
    typeof getInitUpdateMintProofInstructionRaw<
      TProgram,
      TAccountWhitelist,
      TAccountMint,
      TAccountMintProof,
      TAccountUser,
      TAccountSystemProgram
    >
  >[0];
  const accounts: Record<keyof AccountMetas, ResolvedAccount> = {
    whitelist: { value: input.whitelist ?? null, isWritable: false },
    mint: { value: input.mint ?? null, isWritable: false },
    mintProof: { value: input.mintProof ?? null, isWritable: true },
    user: { value: input.user ?? null, isWritable: true },
    systemProgram: { value: input.systemProgram ?? null, isWritable: false },
  };

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

  // Get account metas and signers.
  const accountMetas = getAccountMetasWithSigners(
    accounts,
    'programId',
    programAddress
  );

  const instruction = getInitUpdateMintProofInstructionRaw(
    accountMetas as Record<keyof AccountMetas, IAccountMeta>,
    args as InitUpdateMintProofInstructionDataArgs,
    programAddress
  );

  return instruction;
}

export type InitUpdateMintProofInput<
  TAccountWhitelist extends string,
  TAccountMint extends string,
  TAccountMintProof extends string,
  TAccountUser extends string,
  TAccountSystemProgram extends string,
> = {
  whitelist: Address<TAccountWhitelist>;
  mint: Address<TAccountMint>;
  mintProof: Address<TAccountMintProof>;
  user: Address<TAccountUser>;
  systemProgram?: Address<TAccountSystemProgram>;
  proof: InitUpdateMintProofInstructionDataArgs['proof'];
};

export type InitUpdateMintProofInputWithSigners<
  TAccountWhitelist extends string,
  TAccountMint extends string,
  TAccountMintProof extends string,
  TAccountUser extends string,
  TAccountSystemProgram extends string,
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
  TProgram extends string = 'TL1ST2iRBzuGTqLn1KXnGdSnEow62BzPnGiqyRXhWtW',
>(
  input: InitUpdateMintProofInputWithSigners<
    TAccountWhitelist,
    TAccountMint,
    TAccountMintProof,
    TAccountUser,
    TAccountSystemProgram
  >
): InitUpdateMintProofInstructionWithSigners<
  TProgram,
  TAccountWhitelist,
  TAccountMint,
  TAccountMintProof,
  TAccountUser,
  TAccountSystemProgram
>;
export function getInitUpdateMintProofInstruction<
  TAccountWhitelist extends string,
  TAccountMint extends string,
  TAccountMintProof extends string,
  TAccountUser extends string,
  TAccountSystemProgram extends string,
  TProgram extends string = 'TL1ST2iRBzuGTqLn1KXnGdSnEow62BzPnGiqyRXhWtW',
>(
  input: InitUpdateMintProofInput<
    TAccountWhitelist,
    TAccountMint,
    TAccountMintProof,
    TAccountUser,
    TAccountSystemProgram
  >
): InitUpdateMintProofInstruction<
  TProgram,
  TAccountWhitelist,
  TAccountMint,
  TAccountMintProof,
  TAccountUser,
  TAccountSystemProgram
>;
export function getInitUpdateMintProofInstruction<
  TAccountWhitelist extends string,
  TAccountMint extends string,
  TAccountMintProof extends string,
  TAccountUser extends string,
  TAccountSystemProgram extends string,
  TProgram extends string = 'TL1ST2iRBzuGTqLn1KXnGdSnEow62BzPnGiqyRXhWtW',
>(
  input: InitUpdateMintProofInput<
    TAccountWhitelist,
    TAccountMint,
    TAccountMintProof,
    TAccountUser,
    TAccountSystemProgram
  >
): IInstruction {
  // Program address.
  const programAddress =
    'TL1ST2iRBzuGTqLn1KXnGdSnEow62BzPnGiqyRXhWtW' as Address<'TL1ST2iRBzuGTqLn1KXnGdSnEow62BzPnGiqyRXhWtW'>;

  // Original accounts.
  type AccountMetas = Parameters<
    typeof getInitUpdateMintProofInstructionRaw<
      TProgram,
      TAccountWhitelist,
      TAccountMint,
      TAccountMintProof,
      TAccountUser,
      TAccountSystemProgram
    >
  >[0];
  const accounts: Record<keyof AccountMetas, ResolvedAccount> = {
    whitelist: { value: input.whitelist ?? null, isWritable: false },
    mint: { value: input.mint ?? null, isWritable: false },
    mintProof: { value: input.mintProof ?? null, isWritable: true },
    user: { value: input.user ?? null, isWritable: true },
    systemProgram: { value: input.systemProgram ?? null, isWritable: false },
  };

  // Original args.
  const args = { ...input };

  // Resolve default values.
  if (!accounts.systemProgram.value) {
    accounts.systemProgram.value =
      '11111111111111111111111111111111' as Address<'11111111111111111111111111111111'>;
  }

  // Get account metas and signers.
  const accountMetas = getAccountMetasWithSigners(
    accounts,
    'programId',
    programAddress
  );

  const instruction = getInitUpdateMintProofInstructionRaw(
    accountMetas as Record<keyof AccountMetas, IAccountMeta>,
    args as InitUpdateMintProofInstructionDataArgs,
    programAddress
  );

  return instruction;
}

export function getInitUpdateMintProofInstructionRaw<
  TProgram extends string = 'TL1ST2iRBzuGTqLn1KXnGdSnEow62BzPnGiqyRXhWtW',
  TAccountWhitelist extends string | IAccountMeta<string> = string,
  TAccountMint extends string | IAccountMeta<string> = string,
  TAccountMintProof extends string | IAccountMeta<string> = string,
  TAccountUser extends string | IAccountMeta<string> = string,
  TAccountSystemProgram extends
    | string
    | IAccountMeta<string> = '11111111111111111111111111111111',
  TRemainingAccounts extends Array<IAccountMeta<string>> = [],
>(
  accounts: {
    whitelist: TAccountWhitelist extends string
      ? Address<TAccountWhitelist>
      : TAccountWhitelist;
    mint: TAccountMint extends string ? Address<TAccountMint> : TAccountMint;
    mintProof: TAccountMintProof extends string
      ? Address<TAccountMintProof>
      : TAccountMintProof;
    user: TAccountUser extends string ? Address<TAccountUser> : TAccountUser;
    systemProgram?: TAccountSystemProgram extends string
      ? Address<TAccountSystemProgram>
      : TAccountSystemProgram;
  },
  args: InitUpdateMintProofInstructionDataArgs,
  programAddress: Address<TProgram> = 'TL1ST2iRBzuGTqLn1KXnGdSnEow62BzPnGiqyRXhWtW' as Address<TProgram>,
  remainingAccounts?: TRemainingAccounts
) {
  return {
    accounts: [
      accountMetaWithDefault(accounts.whitelist, AccountRole.READONLY),
      accountMetaWithDefault(accounts.mint, AccountRole.READONLY),
      accountMetaWithDefault(accounts.mintProof, AccountRole.WRITABLE),
      accountMetaWithDefault(accounts.user, AccountRole.WRITABLE_SIGNER),
      accountMetaWithDefault(
        accounts.systemProgram ??
          ('11111111111111111111111111111111' as Address<'11111111111111111111111111111111'>),
        AccountRole.READONLY
      ),
      ...(remainingAccounts ?? []),
    ],
    data: getInitUpdateMintProofInstructionDataEncoder().encode(args),
    programAddress,
  } as InitUpdateMintProofInstruction<
    TProgram,
    TAccountWhitelist,
    TAccountMint,
    TAccountMintProof,
    TAccountUser,
    TAccountSystemProgram,
    TRemainingAccounts
  >;
}

export type ParsedInitUpdateMintProofInstruction<
  TProgram extends string = 'TL1ST2iRBzuGTqLn1KXnGdSnEow62BzPnGiqyRXhWtW',
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
