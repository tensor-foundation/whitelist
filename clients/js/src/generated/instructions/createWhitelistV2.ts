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
  getArrayDecoder,
  getArrayEncoder,
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
import { findWhitelistV2Pda } from '../pdas';
import { TENSOR_WHITELIST_PROGRAM_ADDRESS } from '../programs';
import {
  expectAddress,
  expectSome,
  getAccountMetaFactory,
  type ResolvedAccount,
} from '../shared';
import {
  getConditionDecoder,
  getConditionEncoder,
  type Condition,
  type ConditionArgs,
} from '../types';

export const CREATE_WHITELIST_V2_DISCRIMINATOR = new Uint8Array([
  31, 207, 213, 77, 105, 13, 127, 98,
]);

export function getCreateWhitelistV2DiscriminatorBytes() {
  return fixEncoderSize(getBytesEncoder(), 8).encode(
    CREATE_WHITELIST_V2_DISCRIMINATOR
  );
}

export type CreateWhitelistV2Instruction<
  TProgram extends string = typeof TENSOR_WHITELIST_PROGRAM_ADDRESS,
  TAccountPayer extends string | IAccountMeta<string> = string,
  TAccountUpdateAuthority extends string | IAccountMeta<string> = string,
  TAccountNamespace extends string | IAccountMeta<string> = string,
  TAccountWhitelist extends string | IAccountMeta<string> = string,
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
      TAccountUpdateAuthority extends string
        ? ReadonlySignerAccount<TAccountUpdateAuthority> &
            IAccountSignerMeta<TAccountUpdateAuthority>
        : TAccountUpdateAuthority,
      TAccountNamespace extends string
        ? ReadonlySignerAccount<TAccountNamespace> &
            IAccountSignerMeta<TAccountNamespace>
        : TAccountNamespace,
      TAccountWhitelist extends string
        ? WritableAccount<TAccountWhitelist>
        : TAccountWhitelist,
      TAccountSystemProgram extends string
        ? ReadonlyAccount<TAccountSystemProgram>
        : TAccountSystemProgram,
      ...TRemainingAccounts,
    ]
  >;

export type CreateWhitelistV2InstructionData = {
  discriminator: ReadonlyUint8Array;
  uuid: ReadonlyUint8Array;
  freezeAuthority: Option<Address>;
  conditions: Array<Condition>;
};

export type CreateWhitelistV2InstructionDataArgs = {
  uuid: ReadonlyUint8Array;
  freezeAuthority: OptionOrNullable<Address>;
  conditions: Array<ConditionArgs>;
};

export function getCreateWhitelistV2InstructionDataEncoder(): Encoder<CreateWhitelistV2InstructionDataArgs> {
  return transformEncoder(
    getStructEncoder([
      ['discriminator', fixEncoderSize(getBytesEncoder(), 8)],
      ['uuid', fixEncoderSize(getBytesEncoder(), 32)],
      ['freezeAuthority', getOptionEncoder(getAddressEncoder())],
      ['conditions', getArrayEncoder(getConditionEncoder())],
    ]),
    (value) => ({ ...value, discriminator: CREATE_WHITELIST_V2_DISCRIMINATOR })
  );
}

export function getCreateWhitelistV2InstructionDataDecoder(): Decoder<CreateWhitelistV2InstructionData> {
  return getStructDecoder([
    ['discriminator', fixDecoderSize(getBytesDecoder(), 8)],
    ['uuid', fixDecoderSize(getBytesDecoder(), 32)],
    ['freezeAuthority', getOptionDecoder(getAddressDecoder())],
    ['conditions', getArrayDecoder(getConditionDecoder())],
  ]);
}

export function getCreateWhitelistV2InstructionDataCodec(): Codec<
  CreateWhitelistV2InstructionDataArgs,
  CreateWhitelistV2InstructionData
> {
  return combineCodec(
    getCreateWhitelistV2InstructionDataEncoder(),
    getCreateWhitelistV2InstructionDataDecoder()
  );
}

export type CreateWhitelistV2AsyncInput<
  TAccountPayer extends string = string,
  TAccountUpdateAuthority extends string = string,
  TAccountNamespace extends string = string,
  TAccountWhitelist extends string = string,
  TAccountSystemProgram extends string = string,
> = {
  /** The rent payer. */
  payer: TransactionSigner<TAccountPayer>;
  /** The authority that will be allowed to update the whitelist. */
  updateAuthority: TransactionSigner<TAccountUpdateAuthority>;
  /** Namespace keypair used to derive the whitelist PDA. */
  namespace: TransactionSigner<TAccountNamespace>;
  /** The whitelist PDA. */
  whitelist?: Address<TAccountWhitelist>;
  /** The Solana system program. */
  systemProgram?: Address<TAccountSystemProgram>;
  uuid: CreateWhitelistV2InstructionDataArgs['uuid'];
  freezeAuthority: CreateWhitelistV2InstructionDataArgs['freezeAuthority'];
  conditions: CreateWhitelistV2InstructionDataArgs['conditions'];
};

export async function getCreateWhitelistV2InstructionAsync<
  TAccountPayer extends string,
  TAccountUpdateAuthority extends string,
  TAccountNamespace extends string,
  TAccountWhitelist extends string,
  TAccountSystemProgram extends string,
  TProgramAddress extends Address = typeof TENSOR_WHITELIST_PROGRAM_ADDRESS,
>(
  input: CreateWhitelistV2AsyncInput<
    TAccountPayer,
    TAccountUpdateAuthority,
    TAccountNamespace,
    TAccountWhitelist,
    TAccountSystemProgram
  >,
  config?: { programAddress?: TProgramAddress }
): Promise<
  CreateWhitelistV2Instruction<
    TProgramAddress,
    TAccountPayer,
    TAccountUpdateAuthority,
    TAccountNamespace,
    TAccountWhitelist,
    TAccountSystemProgram
  >
> {
  // Program address.
  const programAddress =
    config?.programAddress ?? TENSOR_WHITELIST_PROGRAM_ADDRESS;

  // Original accounts.
  const originalAccounts = {
    payer: { value: input.payer ?? null, isWritable: true },
    updateAuthority: {
      value: input.updateAuthority ?? null,
      isWritable: false,
    },
    namespace: { value: input.namespace ?? null, isWritable: false },
    whitelist: { value: input.whitelist ?? null, isWritable: true },
    systemProgram: { value: input.systemProgram ?? null, isWritable: false },
  };
  const accounts = originalAccounts as Record<
    keyof typeof originalAccounts,
    ResolvedAccount
  >;

  // Original args.
  const args = { ...input };

  // Resolve default values.
  if (!accounts.whitelist.value) {
    accounts.whitelist.value = await findWhitelistV2Pda({
      namespace: expectAddress(accounts.namespace.value),
      uuid: expectSome(args.uuid),
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
      getAccountMeta(accounts.updateAuthority),
      getAccountMeta(accounts.namespace),
      getAccountMeta(accounts.whitelist),
      getAccountMeta(accounts.systemProgram),
    ],
    programAddress,
    data: getCreateWhitelistV2InstructionDataEncoder().encode(
      args as CreateWhitelistV2InstructionDataArgs
    ),
  } as CreateWhitelistV2Instruction<
    TProgramAddress,
    TAccountPayer,
    TAccountUpdateAuthority,
    TAccountNamespace,
    TAccountWhitelist,
    TAccountSystemProgram
  >;

  return instruction;
}

export type CreateWhitelistV2Input<
  TAccountPayer extends string = string,
  TAccountUpdateAuthority extends string = string,
  TAccountNamespace extends string = string,
  TAccountWhitelist extends string = string,
  TAccountSystemProgram extends string = string,
> = {
  /** The rent payer. */
  payer: TransactionSigner<TAccountPayer>;
  /** The authority that will be allowed to update the whitelist. */
  updateAuthority: TransactionSigner<TAccountUpdateAuthority>;
  /** Namespace keypair used to derive the whitelist PDA. */
  namespace: TransactionSigner<TAccountNamespace>;
  /** The whitelist PDA. */
  whitelist: Address<TAccountWhitelist>;
  /** The Solana system program. */
  systemProgram?: Address<TAccountSystemProgram>;
  uuid: CreateWhitelistV2InstructionDataArgs['uuid'];
  freezeAuthority: CreateWhitelistV2InstructionDataArgs['freezeAuthority'];
  conditions: CreateWhitelistV2InstructionDataArgs['conditions'];
};

export function getCreateWhitelistV2Instruction<
  TAccountPayer extends string,
  TAccountUpdateAuthority extends string,
  TAccountNamespace extends string,
  TAccountWhitelist extends string,
  TAccountSystemProgram extends string,
  TProgramAddress extends Address = typeof TENSOR_WHITELIST_PROGRAM_ADDRESS,
>(
  input: CreateWhitelistV2Input<
    TAccountPayer,
    TAccountUpdateAuthority,
    TAccountNamespace,
    TAccountWhitelist,
    TAccountSystemProgram
  >,
  config?: { programAddress?: TProgramAddress }
): CreateWhitelistV2Instruction<
  TProgramAddress,
  TAccountPayer,
  TAccountUpdateAuthority,
  TAccountNamespace,
  TAccountWhitelist,
  TAccountSystemProgram
> {
  // Program address.
  const programAddress =
    config?.programAddress ?? TENSOR_WHITELIST_PROGRAM_ADDRESS;

  // Original accounts.
  const originalAccounts = {
    payer: { value: input.payer ?? null, isWritable: true },
    updateAuthority: {
      value: input.updateAuthority ?? null,
      isWritable: false,
    },
    namespace: { value: input.namespace ?? null, isWritable: false },
    whitelist: { value: input.whitelist ?? null, isWritable: true },
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
      getAccountMeta(accounts.updateAuthority),
      getAccountMeta(accounts.namespace),
      getAccountMeta(accounts.whitelist),
      getAccountMeta(accounts.systemProgram),
    ],
    programAddress,
    data: getCreateWhitelistV2InstructionDataEncoder().encode(
      args as CreateWhitelistV2InstructionDataArgs
    ),
  } as CreateWhitelistV2Instruction<
    TProgramAddress,
    TAccountPayer,
    TAccountUpdateAuthority,
    TAccountNamespace,
    TAccountWhitelist,
    TAccountSystemProgram
  >;

  return instruction;
}

export type ParsedCreateWhitelistV2Instruction<
  TProgram extends string = typeof TENSOR_WHITELIST_PROGRAM_ADDRESS,
  TAccountMetas extends readonly IAccountMeta[] = readonly IAccountMeta[],
> = {
  programAddress: Address<TProgram>;
  accounts: {
    /** The rent payer. */
    payer: TAccountMetas[0];
    /** The authority that will be allowed to update the whitelist. */
    updateAuthority: TAccountMetas[1];
    /** Namespace keypair used to derive the whitelist PDA. */
    namespace: TAccountMetas[2];
    /** The whitelist PDA. */
    whitelist: TAccountMetas[3];
    /** The Solana system program. */
    systemProgram: TAccountMetas[4];
  };
  data: CreateWhitelistV2InstructionData;
};

export function parseCreateWhitelistV2Instruction<
  TProgram extends string,
  TAccountMetas extends readonly IAccountMeta[],
>(
  instruction: IInstruction<TProgram> &
    IInstructionWithAccounts<TAccountMetas> &
    IInstructionWithData<Uint8Array>
): ParsedCreateWhitelistV2Instruction<TProgram, TAccountMetas> {
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
      updateAuthority: getNextAccount(),
      namespace: getNextAccount(),
      whitelist: getNextAccount(),
      systemProgram: getNextAccount(),
    },
    data: getCreateWhitelistV2InstructionDataDecoder().decode(instruction.data),
  };
}
