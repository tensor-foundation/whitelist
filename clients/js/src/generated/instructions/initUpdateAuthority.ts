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
  getAddressDecoder,
  getAddressEncoder,
  getBytesDecoder,
  getBytesEncoder,
  getOptionDecoder,
  getOptionEncoder,
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
  type Option,
  type OptionOrNullable,
  type ReadonlyAccount,
  type ReadonlySignerAccount,
  type ReadonlyUint8Array,
  type TransactionSigner,
  type WritableAccount,
  type WritableSignerAccount,
} from '@solana/web3.js';
import { findAuthorityPda } from '../pdas';
import { TENSOR_WHITELIST_PROGRAM_ADDRESS } from '../programs';
import { getAccountMetaFactory, type ResolvedAccount } from '../shared';

export const INIT_UPDATE_AUTHORITY_DISCRIMINATOR = new Uint8Array([
  53, 144, 79, 150, 196, 110, 22, 55,
]);

export function getInitUpdateAuthorityDiscriminatorBytes() {
  return fixEncoderSize(getBytesEncoder(), 8).encode(
    INIT_UPDATE_AUTHORITY_DISCRIMINATOR
  );
}

export type InitUpdateAuthorityInstruction<
  TProgram extends string = typeof TENSOR_WHITELIST_PROGRAM_ADDRESS,
  TAccountWhitelistAuthority extends string | IAccountMeta<string> = string,
  TAccountCosigner extends string | IAccountMeta<string> = string,
  TAccountOwner extends string | IAccountMeta<string> = string,
  TAccountSystemProgram extends
    | string
    | IAccountMeta<string> = '11111111111111111111111111111111',
  TRemainingAccounts extends readonly IAccountMeta<string>[] = [],
> = IInstruction<TProgram> &
  IInstructionWithData<Uint8Array> &
  IInstructionWithAccounts<
    [
      TAccountWhitelistAuthority extends string
        ? WritableAccount<TAccountWhitelistAuthority>
        : TAccountWhitelistAuthority,
      TAccountCosigner extends string
        ? WritableSignerAccount<TAccountCosigner> &
            IAccountSignerMeta<TAccountCosigner>
        : TAccountCosigner,
      TAccountOwner extends string
        ? ReadonlySignerAccount<TAccountOwner> &
            IAccountSignerMeta<TAccountOwner>
        : TAccountOwner,
      TAccountSystemProgram extends string
        ? ReadonlyAccount<TAccountSystemProgram>
        : TAccountSystemProgram,
      ...TRemainingAccounts,
    ]
  >;

export type InitUpdateAuthorityInstructionData = {
  discriminator: ReadonlyUint8Array;
  newCosigner: Option<Address>;
  newOwner: Option<Address>;
};

export type InitUpdateAuthorityInstructionDataArgs = {
  newCosigner: OptionOrNullable<Address>;
  newOwner: OptionOrNullable<Address>;
};

export function getInitUpdateAuthorityInstructionDataEncoder(): Encoder<InitUpdateAuthorityInstructionDataArgs> {
  return transformEncoder(
    getStructEncoder([
      ['discriminator', fixEncoderSize(getBytesEncoder(), 8)],
      ['newCosigner', getOptionEncoder(getAddressEncoder())],
      ['newOwner', getOptionEncoder(getAddressEncoder())],
    ]),
    (value) => ({
      ...value,
      discriminator: INIT_UPDATE_AUTHORITY_DISCRIMINATOR,
    })
  );
}

export function getInitUpdateAuthorityInstructionDataDecoder(): Decoder<InitUpdateAuthorityInstructionData> {
  return getStructDecoder([
    ['discriminator', fixDecoderSize(getBytesDecoder(), 8)],
    ['newCosigner', getOptionDecoder(getAddressDecoder())],
    ['newOwner', getOptionDecoder(getAddressDecoder())],
  ]);
}

export function getInitUpdateAuthorityInstructionDataCodec(): Codec<
  InitUpdateAuthorityInstructionDataArgs,
  InitUpdateAuthorityInstructionData
> {
  return combineCodec(
    getInitUpdateAuthorityInstructionDataEncoder(),
    getInitUpdateAuthorityInstructionDataDecoder()
  );
}

export type InitUpdateAuthorityAsyncInput<
  TAccountWhitelistAuthority extends string = string,
  TAccountCosigner extends string = string,
  TAccountOwner extends string = string,
  TAccountSystemProgram extends string = string,
> = {
  whitelistAuthority?: Address<TAccountWhitelistAuthority>;
  /** both have to sign on any updates */
  cosigner: TransactionSigner<TAccountCosigner>;
  owner: TransactionSigner<TAccountOwner>;
  systemProgram?: Address<TAccountSystemProgram>;
  newCosigner: InitUpdateAuthorityInstructionDataArgs['newCosigner'];
  newOwner: InitUpdateAuthorityInstructionDataArgs['newOwner'];
};

export async function getInitUpdateAuthorityInstructionAsync<
  TAccountWhitelistAuthority extends string,
  TAccountCosigner extends string,
  TAccountOwner extends string,
  TAccountSystemProgram extends string,
  TProgramAddress extends Address = typeof TENSOR_WHITELIST_PROGRAM_ADDRESS,
>(
  input: InitUpdateAuthorityAsyncInput<
    TAccountWhitelistAuthority,
    TAccountCosigner,
    TAccountOwner,
    TAccountSystemProgram
  >,
  config?: { programAddress?: TProgramAddress }
): Promise<
  InitUpdateAuthorityInstruction<
    TProgramAddress,
    TAccountWhitelistAuthority,
    TAccountCosigner,
    TAccountOwner,
    TAccountSystemProgram
  >
> {
  // Program address.
  const programAddress =
    config?.programAddress ?? TENSOR_WHITELIST_PROGRAM_ADDRESS;

  // Original accounts.
  const originalAccounts = {
    whitelistAuthority: {
      value: input.whitelistAuthority ?? null,
      isWritable: true,
    },
    cosigner: { value: input.cosigner ?? null, isWritable: true },
    owner: { value: input.owner ?? null, isWritable: false },
    systemProgram: { value: input.systemProgram ?? null, isWritable: false },
  };
  const accounts = originalAccounts as Record<
    keyof typeof originalAccounts,
    ResolvedAccount
  >;

  // Original args.
  const args = { ...input };

  // Resolve default values.
  if (!accounts.whitelistAuthority.value) {
    accounts.whitelistAuthority.value = await findAuthorityPda();
  }
  if (!accounts.systemProgram.value) {
    accounts.systemProgram.value =
      '11111111111111111111111111111111' as Address<'11111111111111111111111111111111'>;
  }

  const getAccountMeta = getAccountMetaFactory(programAddress, 'programId');
  const instruction = {
    accounts: [
      getAccountMeta(accounts.whitelistAuthority),
      getAccountMeta(accounts.cosigner),
      getAccountMeta(accounts.owner),
      getAccountMeta(accounts.systemProgram),
    ],
    programAddress,
    data: getInitUpdateAuthorityInstructionDataEncoder().encode(
      args as InitUpdateAuthorityInstructionDataArgs
    ),
  } as InitUpdateAuthorityInstruction<
    TProgramAddress,
    TAccountWhitelistAuthority,
    TAccountCosigner,
    TAccountOwner,
    TAccountSystemProgram
  >;

  return instruction;
}

export type InitUpdateAuthorityInput<
  TAccountWhitelistAuthority extends string = string,
  TAccountCosigner extends string = string,
  TAccountOwner extends string = string,
  TAccountSystemProgram extends string = string,
> = {
  whitelistAuthority: Address<TAccountWhitelistAuthority>;
  /** both have to sign on any updates */
  cosigner: TransactionSigner<TAccountCosigner>;
  owner: TransactionSigner<TAccountOwner>;
  systemProgram?: Address<TAccountSystemProgram>;
  newCosigner: InitUpdateAuthorityInstructionDataArgs['newCosigner'];
  newOwner: InitUpdateAuthorityInstructionDataArgs['newOwner'];
};

export function getInitUpdateAuthorityInstruction<
  TAccountWhitelistAuthority extends string,
  TAccountCosigner extends string,
  TAccountOwner extends string,
  TAccountSystemProgram extends string,
  TProgramAddress extends Address = typeof TENSOR_WHITELIST_PROGRAM_ADDRESS,
>(
  input: InitUpdateAuthorityInput<
    TAccountWhitelistAuthority,
    TAccountCosigner,
    TAccountOwner,
    TAccountSystemProgram
  >,
  config?: { programAddress?: TProgramAddress }
): InitUpdateAuthorityInstruction<
  TProgramAddress,
  TAccountWhitelistAuthority,
  TAccountCosigner,
  TAccountOwner,
  TAccountSystemProgram
> {
  // Program address.
  const programAddress =
    config?.programAddress ?? TENSOR_WHITELIST_PROGRAM_ADDRESS;

  // Original accounts.
  const originalAccounts = {
    whitelistAuthority: {
      value: input.whitelistAuthority ?? null,
      isWritable: true,
    },
    cosigner: { value: input.cosigner ?? null, isWritable: true },
    owner: { value: input.owner ?? null, isWritable: false },
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
      getAccountMeta(accounts.whitelistAuthority),
      getAccountMeta(accounts.cosigner),
      getAccountMeta(accounts.owner),
      getAccountMeta(accounts.systemProgram),
    ],
    programAddress,
    data: getInitUpdateAuthorityInstructionDataEncoder().encode(
      args as InitUpdateAuthorityInstructionDataArgs
    ),
  } as InitUpdateAuthorityInstruction<
    TProgramAddress,
    TAccountWhitelistAuthority,
    TAccountCosigner,
    TAccountOwner,
    TAccountSystemProgram
  >;

  return instruction;
}

export type ParsedInitUpdateAuthorityInstruction<
  TProgram extends string = typeof TENSOR_WHITELIST_PROGRAM_ADDRESS,
  TAccountMetas extends readonly IAccountMeta[] = readonly IAccountMeta[],
> = {
  programAddress: Address<TProgram>;
  accounts: {
    whitelistAuthority: TAccountMetas[0];
    /** both have to sign on any updates */
    cosigner: TAccountMetas[1];
    owner: TAccountMetas[2];
    systemProgram: TAccountMetas[3];
  };
  data: InitUpdateAuthorityInstructionData;
};

export function parseInitUpdateAuthorityInstruction<
  TProgram extends string,
  TAccountMetas extends readonly IAccountMeta[],
>(
  instruction: IInstruction<TProgram> &
    IInstructionWithAccounts<TAccountMetas> &
    IInstructionWithData<Uint8Array>
): ParsedInitUpdateAuthorityInstruction<TProgram, TAccountMetas> {
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
      whitelistAuthority: getNextAccount(),
      cosigner: getNextAccount(),
      owner: getNextAccount(),
      systemProgram: getNextAccount(),
    },
    data: getInitUpdateAuthorityInstructionDataDecoder().decode(
      instruction.data
    ),
  };
}
