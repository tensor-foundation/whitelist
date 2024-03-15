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
  ReadonlyAccount,
  ReadonlySignerAccount,
  WritableAccount,
} from '@solana/instructions';
import { IAccountSignerMeta, TransactionSigner } from '@solana/signers';
import { findMasterEditionPda, findMetadataPda } from '../pdas';
import {
  ResolvedAccount,
  accountMetaWithDefault,
  expectAddress,
  getAccountMetasWithSigners,
} from '../shared';

export type VerifyCollectionV1Instruction<
  TProgram extends string = 'metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s',
  TAccountAuthority extends string | IAccountMeta<string> = string,
  TAccountDelegateRecord extends string | IAccountMeta<string> = string,
  TAccountMetadata extends string | IAccountMeta<string> = string,
  TAccountCollectionMint extends string | IAccountMeta<string> = string,
  TAccountCollectionMetadata extends string | IAccountMeta<string> = string,
  TAccountCollectionMasterEdition extends
    | string
    | IAccountMeta<string> = string,
  TAccountSystemProgram extends
    | string
    | IAccountMeta<string> = '11111111111111111111111111111111',
  TAccountSysvarInstructions extends
    | string
    | IAccountMeta<string> = 'Sysvar1nstructions1111111111111111111111111',
  TRemainingAccounts extends Array<IAccountMeta<string>> = []
> = IInstruction<TProgram> &
  IInstructionWithData<Uint8Array> &
  IInstructionWithAccounts<
    [
      TAccountAuthority extends string
        ? ReadonlySignerAccount<TAccountAuthority>
        : TAccountAuthority,
      TAccountDelegateRecord extends string
        ? ReadonlyAccount<TAccountDelegateRecord>
        : TAccountDelegateRecord,
      TAccountMetadata extends string
        ? WritableAccount<TAccountMetadata>
        : TAccountMetadata,
      TAccountCollectionMint extends string
        ? ReadonlyAccount<TAccountCollectionMint>
        : TAccountCollectionMint,
      TAccountCollectionMetadata extends string
        ? WritableAccount<TAccountCollectionMetadata>
        : TAccountCollectionMetadata,
      TAccountCollectionMasterEdition extends string
        ? ReadonlyAccount<TAccountCollectionMasterEdition>
        : TAccountCollectionMasterEdition,
      TAccountSystemProgram extends string
        ? ReadonlyAccount<TAccountSystemProgram>
        : TAccountSystemProgram,
      TAccountSysvarInstructions extends string
        ? ReadonlyAccount<TAccountSysvarInstructions>
        : TAccountSysvarInstructions,
      ...TRemainingAccounts
    ]
  >;

export type VerifyCollectionV1InstructionWithSigners<
  TProgram extends string = 'metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s',
  TAccountAuthority extends string | IAccountMeta<string> = string,
  TAccountDelegateRecord extends string | IAccountMeta<string> = string,
  TAccountMetadata extends string | IAccountMeta<string> = string,
  TAccountCollectionMint extends string | IAccountMeta<string> = string,
  TAccountCollectionMetadata extends string | IAccountMeta<string> = string,
  TAccountCollectionMasterEdition extends
    | string
    | IAccountMeta<string> = string,
  TAccountSystemProgram extends
    | string
    | IAccountMeta<string> = '11111111111111111111111111111111',
  TAccountSysvarInstructions extends
    | string
    | IAccountMeta<string> = 'Sysvar1nstructions1111111111111111111111111',
  TRemainingAccounts extends Array<IAccountMeta<string>> = []
> = IInstruction<TProgram> &
  IInstructionWithData<Uint8Array> &
  IInstructionWithAccounts<
    [
      TAccountAuthority extends string
        ? ReadonlySignerAccount<TAccountAuthority> &
            IAccountSignerMeta<TAccountAuthority>
        : TAccountAuthority,
      TAccountDelegateRecord extends string
        ? ReadonlyAccount<TAccountDelegateRecord>
        : TAccountDelegateRecord,
      TAccountMetadata extends string
        ? WritableAccount<TAccountMetadata>
        : TAccountMetadata,
      TAccountCollectionMint extends string
        ? ReadonlyAccount<TAccountCollectionMint>
        : TAccountCollectionMint,
      TAccountCollectionMetadata extends string
        ? WritableAccount<TAccountCollectionMetadata>
        : TAccountCollectionMetadata,
      TAccountCollectionMasterEdition extends string
        ? ReadonlyAccount<TAccountCollectionMasterEdition>
        : TAccountCollectionMasterEdition,
      TAccountSystemProgram extends string
        ? ReadonlyAccount<TAccountSystemProgram>
        : TAccountSystemProgram,
      TAccountSysvarInstructions extends string
        ? ReadonlyAccount<TAccountSysvarInstructions>
        : TAccountSysvarInstructions,
      ...TRemainingAccounts
    ]
  >;

export type VerifyCollectionV1InstructionData = {
  discriminator: number;
  verifyCollectionV1Discriminator: number;
};

export type VerifyCollectionV1InstructionDataArgs = {};

export function getVerifyCollectionV1InstructionDataEncoder(): Encoder<VerifyCollectionV1InstructionDataArgs> {
  return mapEncoder(
    getStructEncoder([
      ['discriminator', getU8Encoder()],
      ['verifyCollectionV1Discriminator', getU8Encoder()],
    ]),
    (value) => ({
      ...value,
      discriminator: 52,
      verifyCollectionV1Discriminator: 1,
    })
  );
}

export function getVerifyCollectionV1InstructionDataDecoder(): Decoder<VerifyCollectionV1InstructionData> {
  return getStructDecoder([
    ['discriminator', getU8Decoder()],
    ['verifyCollectionV1Discriminator', getU8Decoder()],
  ]);
}

export function getVerifyCollectionV1InstructionDataCodec(): Codec<
  VerifyCollectionV1InstructionDataArgs,
  VerifyCollectionV1InstructionData
> {
  return combineCodec(
    getVerifyCollectionV1InstructionDataEncoder(),
    getVerifyCollectionV1InstructionDataDecoder()
  );
}

export type VerifyCollectionV1AsyncInput<
  TAccountAuthority extends string,
  TAccountDelegateRecord extends string,
  TAccountMetadata extends string,
  TAccountCollectionMint extends string,
  TAccountCollectionMetadata extends string,
  TAccountCollectionMasterEdition extends string,
  TAccountSystemProgram extends string,
  TAccountSysvarInstructions extends string
> = {
  /** Creator to verify, collection update authority or delegate */
  authority: Address<TAccountAuthority>;
  /** Delegate record PDA */
  delegateRecord?: Address<TAccountDelegateRecord>;
  /** Metadata account */
  metadata: Address<TAccountMetadata>;
  /** Mint of the Collection */
  collectionMint: Address<TAccountCollectionMint>;
  /** Metadata Account of the Collection */
  collectionMetadata?: Address<TAccountCollectionMetadata>;
  /** Master Edition Account of the Collection Token */
  collectionMasterEdition?: Address<TAccountCollectionMasterEdition>;
  /** System program */
  systemProgram?: Address<TAccountSystemProgram>;
  /** Instructions sysvar account */
  sysvarInstructions?: Address<TAccountSysvarInstructions>;
};

export type VerifyCollectionV1AsyncInputWithSigners<
  TAccountAuthority extends string,
  TAccountDelegateRecord extends string,
  TAccountMetadata extends string,
  TAccountCollectionMint extends string,
  TAccountCollectionMetadata extends string,
  TAccountCollectionMasterEdition extends string,
  TAccountSystemProgram extends string,
  TAccountSysvarInstructions extends string
> = {
  /** Creator to verify, collection update authority or delegate */
  authority: TransactionSigner<TAccountAuthority>;
  /** Delegate record PDA */
  delegateRecord?: Address<TAccountDelegateRecord>;
  /** Metadata account */
  metadata: Address<TAccountMetadata>;
  /** Mint of the Collection */
  collectionMint: Address<TAccountCollectionMint>;
  /** Metadata Account of the Collection */
  collectionMetadata?: Address<TAccountCollectionMetadata>;
  /** Master Edition Account of the Collection Token */
  collectionMasterEdition?: Address<TAccountCollectionMasterEdition>;
  /** System program */
  systemProgram?: Address<TAccountSystemProgram>;
  /** Instructions sysvar account */
  sysvarInstructions?: Address<TAccountSysvarInstructions>;
};

export async function getVerifyCollectionV1InstructionAsync<
  TAccountAuthority extends string,
  TAccountDelegateRecord extends string,
  TAccountMetadata extends string,
  TAccountCollectionMint extends string,
  TAccountCollectionMetadata extends string,
  TAccountCollectionMasterEdition extends string,
  TAccountSystemProgram extends string,
  TAccountSysvarInstructions extends string,
  TProgram extends string = 'metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s'
>(
  input: VerifyCollectionV1AsyncInputWithSigners<
    TAccountAuthority,
    TAccountDelegateRecord,
    TAccountMetadata,
    TAccountCollectionMint,
    TAccountCollectionMetadata,
    TAccountCollectionMasterEdition,
    TAccountSystemProgram,
    TAccountSysvarInstructions
  >
): Promise<
  VerifyCollectionV1InstructionWithSigners<
    TProgram,
    TAccountAuthority,
    TAccountDelegateRecord,
    TAccountMetadata,
    TAccountCollectionMint,
    TAccountCollectionMetadata,
    TAccountCollectionMasterEdition,
    TAccountSystemProgram,
    TAccountSysvarInstructions
  >
>;
export async function getVerifyCollectionV1InstructionAsync<
  TAccountAuthority extends string,
  TAccountDelegateRecord extends string,
  TAccountMetadata extends string,
  TAccountCollectionMint extends string,
  TAccountCollectionMetadata extends string,
  TAccountCollectionMasterEdition extends string,
  TAccountSystemProgram extends string,
  TAccountSysvarInstructions extends string,
  TProgram extends string = 'metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s'
>(
  input: VerifyCollectionV1AsyncInput<
    TAccountAuthority,
    TAccountDelegateRecord,
    TAccountMetadata,
    TAccountCollectionMint,
    TAccountCollectionMetadata,
    TAccountCollectionMasterEdition,
    TAccountSystemProgram,
    TAccountSysvarInstructions
  >
): Promise<
  VerifyCollectionV1Instruction<
    TProgram,
    TAccountAuthority,
    TAccountDelegateRecord,
    TAccountMetadata,
    TAccountCollectionMint,
    TAccountCollectionMetadata,
    TAccountCollectionMasterEdition,
    TAccountSystemProgram,
    TAccountSysvarInstructions
  >
>;
export async function getVerifyCollectionV1InstructionAsync<
  TAccountAuthority extends string,
  TAccountDelegateRecord extends string,
  TAccountMetadata extends string,
  TAccountCollectionMint extends string,
  TAccountCollectionMetadata extends string,
  TAccountCollectionMasterEdition extends string,
  TAccountSystemProgram extends string,
  TAccountSysvarInstructions extends string,
  TProgram extends string = 'metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s'
>(
  input: VerifyCollectionV1AsyncInput<
    TAccountAuthority,
    TAccountDelegateRecord,
    TAccountMetadata,
    TAccountCollectionMint,
    TAccountCollectionMetadata,
    TAccountCollectionMasterEdition,
    TAccountSystemProgram,
    TAccountSysvarInstructions
  >
): Promise<IInstruction> {
  // Program address.
  const programAddress =
    'metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s' as Address<'metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s'>;

  // Original accounts.
  type AccountMetas = Parameters<
    typeof getVerifyCollectionV1InstructionRaw<
      TProgram,
      TAccountAuthority,
      TAccountDelegateRecord,
      TAccountMetadata,
      TAccountCollectionMint,
      TAccountCollectionMetadata,
      TAccountCollectionMasterEdition,
      TAccountSystemProgram,
      TAccountSysvarInstructions
    >
  >[0];
  const accounts: Record<keyof AccountMetas, ResolvedAccount> = {
    authority: { value: input.authority ?? null, isWritable: false },
    delegateRecord: { value: input.delegateRecord ?? null, isWritable: false },
    metadata: { value: input.metadata ?? null, isWritable: true },
    collectionMint: { value: input.collectionMint ?? null, isWritable: false },
    collectionMetadata: {
      value: input.collectionMetadata ?? null,
      isWritable: true,
    },
    collectionMasterEdition: {
      value: input.collectionMasterEdition ?? null,
      isWritable: false,
    },
    systemProgram: { value: input.systemProgram ?? null, isWritable: false },
    sysvarInstructions: {
      value: input.sysvarInstructions ?? null,
      isWritable: false,
    },
  };

  // Resolve default values.
  if (!accounts.collectionMetadata.value) {
    accounts.collectionMetadata.value = await findMetadataPda({
      mint: expectAddress(accounts.collectionMint.value),
    });
  }
  if (!accounts.collectionMasterEdition.value) {
    accounts.collectionMasterEdition.value = await findMasterEditionPda({
      mint: expectAddress(accounts.collectionMint.value),
    });
  }
  if (!accounts.systemProgram.value) {
    accounts.systemProgram.value =
      '11111111111111111111111111111111' as Address<'11111111111111111111111111111111'>;
  }
  if (!accounts.sysvarInstructions.value) {
    accounts.sysvarInstructions.value =
      'Sysvar1nstructions1111111111111111111111111' as Address<'Sysvar1nstructions1111111111111111111111111'>;
  }

  // Get account metas and signers.
  const accountMetas = getAccountMetasWithSigners(
    accounts,
    'programId',
    programAddress
  );

  const instruction = getVerifyCollectionV1InstructionRaw(
    accountMetas as Record<keyof AccountMetas, IAccountMeta>,
    programAddress
  );

  return instruction;
}

export type VerifyCollectionV1Input<
  TAccountAuthority extends string,
  TAccountDelegateRecord extends string,
  TAccountMetadata extends string,
  TAccountCollectionMint extends string,
  TAccountCollectionMetadata extends string,
  TAccountCollectionMasterEdition extends string,
  TAccountSystemProgram extends string,
  TAccountSysvarInstructions extends string
> = {
  /** Creator to verify, collection update authority or delegate */
  authority: Address<TAccountAuthority>;
  /** Delegate record PDA */
  delegateRecord?: Address<TAccountDelegateRecord>;
  /** Metadata account */
  metadata: Address<TAccountMetadata>;
  /** Mint of the Collection */
  collectionMint: Address<TAccountCollectionMint>;
  /** Metadata Account of the Collection */
  collectionMetadata?: Address<TAccountCollectionMetadata>;
  /** Master Edition Account of the Collection Token */
  collectionMasterEdition?: Address<TAccountCollectionMasterEdition>;
  /** System program */
  systemProgram?: Address<TAccountSystemProgram>;
  /** Instructions sysvar account */
  sysvarInstructions?: Address<TAccountSysvarInstructions>;
};

export type VerifyCollectionV1InputWithSigners<
  TAccountAuthority extends string,
  TAccountDelegateRecord extends string,
  TAccountMetadata extends string,
  TAccountCollectionMint extends string,
  TAccountCollectionMetadata extends string,
  TAccountCollectionMasterEdition extends string,
  TAccountSystemProgram extends string,
  TAccountSysvarInstructions extends string
> = {
  /** Creator to verify, collection update authority or delegate */
  authority: TransactionSigner<TAccountAuthority>;
  /** Delegate record PDA */
  delegateRecord?: Address<TAccountDelegateRecord>;
  /** Metadata account */
  metadata: Address<TAccountMetadata>;
  /** Mint of the Collection */
  collectionMint: Address<TAccountCollectionMint>;
  /** Metadata Account of the Collection */
  collectionMetadata?: Address<TAccountCollectionMetadata>;
  /** Master Edition Account of the Collection Token */
  collectionMasterEdition?: Address<TAccountCollectionMasterEdition>;
  /** System program */
  systemProgram?: Address<TAccountSystemProgram>;
  /** Instructions sysvar account */
  sysvarInstructions?: Address<TAccountSysvarInstructions>;
};

export function getVerifyCollectionV1Instruction<
  TAccountAuthority extends string,
  TAccountDelegateRecord extends string,
  TAccountMetadata extends string,
  TAccountCollectionMint extends string,
  TAccountCollectionMetadata extends string,
  TAccountCollectionMasterEdition extends string,
  TAccountSystemProgram extends string,
  TAccountSysvarInstructions extends string,
  TProgram extends string = 'metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s'
>(
  input: VerifyCollectionV1InputWithSigners<
    TAccountAuthority,
    TAccountDelegateRecord,
    TAccountMetadata,
    TAccountCollectionMint,
    TAccountCollectionMetadata,
    TAccountCollectionMasterEdition,
    TAccountSystemProgram,
    TAccountSysvarInstructions
  >
): VerifyCollectionV1InstructionWithSigners<
  TProgram,
  TAccountAuthority,
  TAccountDelegateRecord,
  TAccountMetadata,
  TAccountCollectionMint,
  TAccountCollectionMetadata,
  TAccountCollectionMasterEdition,
  TAccountSystemProgram,
  TAccountSysvarInstructions
>;
export function getVerifyCollectionV1Instruction<
  TAccountAuthority extends string,
  TAccountDelegateRecord extends string,
  TAccountMetadata extends string,
  TAccountCollectionMint extends string,
  TAccountCollectionMetadata extends string,
  TAccountCollectionMasterEdition extends string,
  TAccountSystemProgram extends string,
  TAccountSysvarInstructions extends string,
  TProgram extends string = 'metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s'
>(
  input: VerifyCollectionV1Input<
    TAccountAuthority,
    TAccountDelegateRecord,
    TAccountMetadata,
    TAccountCollectionMint,
    TAccountCollectionMetadata,
    TAccountCollectionMasterEdition,
    TAccountSystemProgram,
    TAccountSysvarInstructions
  >
): VerifyCollectionV1Instruction<
  TProgram,
  TAccountAuthority,
  TAccountDelegateRecord,
  TAccountMetadata,
  TAccountCollectionMint,
  TAccountCollectionMetadata,
  TAccountCollectionMasterEdition,
  TAccountSystemProgram,
  TAccountSysvarInstructions
>;
export function getVerifyCollectionV1Instruction<
  TAccountAuthority extends string,
  TAccountDelegateRecord extends string,
  TAccountMetadata extends string,
  TAccountCollectionMint extends string,
  TAccountCollectionMetadata extends string,
  TAccountCollectionMasterEdition extends string,
  TAccountSystemProgram extends string,
  TAccountSysvarInstructions extends string,
  TProgram extends string = 'metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s'
>(
  input: VerifyCollectionV1Input<
    TAccountAuthority,
    TAccountDelegateRecord,
    TAccountMetadata,
    TAccountCollectionMint,
    TAccountCollectionMetadata,
    TAccountCollectionMasterEdition,
    TAccountSystemProgram,
    TAccountSysvarInstructions
  >
): IInstruction {
  // Program address.
  const programAddress =
    'metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s' as Address<'metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s'>;

  // Original accounts.
  type AccountMetas = Parameters<
    typeof getVerifyCollectionV1InstructionRaw<
      TProgram,
      TAccountAuthority,
      TAccountDelegateRecord,
      TAccountMetadata,
      TAccountCollectionMint,
      TAccountCollectionMetadata,
      TAccountCollectionMasterEdition,
      TAccountSystemProgram,
      TAccountSysvarInstructions
    >
  >[0];
  const accounts: Record<keyof AccountMetas, ResolvedAccount> = {
    authority: { value: input.authority ?? null, isWritable: false },
    delegateRecord: { value: input.delegateRecord ?? null, isWritable: false },
    metadata: { value: input.metadata ?? null, isWritable: true },
    collectionMint: { value: input.collectionMint ?? null, isWritable: false },
    collectionMetadata: {
      value: input.collectionMetadata ?? null,
      isWritable: true,
    },
    collectionMasterEdition: {
      value: input.collectionMasterEdition ?? null,
      isWritable: false,
    },
    systemProgram: { value: input.systemProgram ?? null, isWritable: false },
    sysvarInstructions: {
      value: input.sysvarInstructions ?? null,
      isWritable: false,
    },
  };

  // Resolve default values.
  if (!accounts.systemProgram.value) {
    accounts.systemProgram.value =
      '11111111111111111111111111111111' as Address<'11111111111111111111111111111111'>;
  }
  if (!accounts.sysvarInstructions.value) {
    accounts.sysvarInstructions.value =
      'Sysvar1nstructions1111111111111111111111111' as Address<'Sysvar1nstructions1111111111111111111111111'>;
  }

  // Get account metas and signers.
  const accountMetas = getAccountMetasWithSigners(
    accounts,
    'programId',
    programAddress
  );

  const instruction = getVerifyCollectionV1InstructionRaw(
    accountMetas as Record<keyof AccountMetas, IAccountMeta>,
    programAddress
  );

  return instruction;
}

export function getVerifyCollectionV1InstructionRaw<
  TProgram extends string = 'metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s',
  TAccountAuthority extends string | IAccountMeta<string> = string,
  TAccountDelegateRecord extends string | IAccountMeta<string> = string,
  TAccountMetadata extends string | IAccountMeta<string> = string,
  TAccountCollectionMint extends string | IAccountMeta<string> = string,
  TAccountCollectionMetadata extends string | IAccountMeta<string> = string,
  TAccountCollectionMasterEdition extends
    | string
    | IAccountMeta<string> = string,
  TAccountSystemProgram extends
    | string
    | IAccountMeta<string> = '11111111111111111111111111111111',
  TAccountSysvarInstructions extends
    | string
    | IAccountMeta<string> = 'Sysvar1nstructions1111111111111111111111111',
  TRemainingAccounts extends Array<IAccountMeta<string>> = []
>(
  accounts: {
    authority: TAccountAuthority extends string
      ? Address<TAccountAuthority>
      : TAccountAuthority;
    delegateRecord?: TAccountDelegateRecord extends string
      ? Address<TAccountDelegateRecord>
      : TAccountDelegateRecord;
    metadata: TAccountMetadata extends string
      ? Address<TAccountMetadata>
      : TAccountMetadata;
    collectionMint: TAccountCollectionMint extends string
      ? Address<TAccountCollectionMint>
      : TAccountCollectionMint;
    collectionMetadata?: TAccountCollectionMetadata extends string
      ? Address<TAccountCollectionMetadata>
      : TAccountCollectionMetadata;
    collectionMasterEdition?: TAccountCollectionMasterEdition extends string
      ? Address<TAccountCollectionMasterEdition>
      : TAccountCollectionMasterEdition;
    systemProgram?: TAccountSystemProgram extends string
      ? Address<TAccountSystemProgram>
      : TAccountSystemProgram;
    sysvarInstructions?: TAccountSysvarInstructions extends string
      ? Address<TAccountSysvarInstructions>
      : TAccountSysvarInstructions;
  },
  programAddress: Address<TProgram> = 'metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s' as Address<TProgram>,
  remainingAccounts?: TRemainingAccounts
) {
  return {
    accounts: [
      accountMetaWithDefault(accounts.authority, AccountRole.READONLY_SIGNER),
      accountMetaWithDefault(
        accounts.delegateRecord ?? {
          address:
            'metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s' as Address<'metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s'>,
          role: AccountRole.READONLY,
        },
        AccountRole.READONLY
      ),
      accountMetaWithDefault(accounts.metadata, AccountRole.WRITABLE),
      accountMetaWithDefault(accounts.collectionMint, AccountRole.READONLY),
      accountMetaWithDefault(
        accounts.collectionMetadata ?? {
          address:
            'metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s' as Address<'metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s'>,
          role: AccountRole.READONLY,
        },
        AccountRole.WRITABLE
      ),
      accountMetaWithDefault(
        accounts.collectionMasterEdition ?? {
          address:
            'metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s' as Address<'metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s'>,
          role: AccountRole.READONLY,
        },
        AccountRole.READONLY
      ),
      accountMetaWithDefault(
        accounts.systemProgram ??
          ('11111111111111111111111111111111' as Address<'11111111111111111111111111111111'>),
        AccountRole.READONLY
      ),
      accountMetaWithDefault(
        accounts.sysvarInstructions ??
          ('Sysvar1nstructions1111111111111111111111111' as Address<'Sysvar1nstructions1111111111111111111111111'>),
        AccountRole.READONLY
      ),
      ...(remainingAccounts ?? []),
    ],
    data: getVerifyCollectionV1InstructionDataEncoder().encode({}),
    programAddress,
  } as VerifyCollectionV1Instruction<
    TProgram,
    TAccountAuthority,
    TAccountDelegateRecord,
    TAccountMetadata,
    TAccountCollectionMint,
    TAccountCollectionMetadata,
    TAccountCollectionMasterEdition,
    TAccountSystemProgram,
    TAccountSysvarInstructions,
    TRemainingAccounts
  >;
}

export type ParsedVerifyCollectionV1Instruction<
  TProgram extends string = 'metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s',
  TAccountMetas extends readonly IAccountMeta[] = readonly IAccountMeta[]
> = {
  programAddress: Address<TProgram>;
  accounts: {
    /** Creator to verify, collection update authority or delegate */
    authority: TAccountMetas[0];
    /** Delegate record PDA */
    delegateRecord?: TAccountMetas[1] | undefined;
    /** Metadata account */
    metadata: TAccountMetas[2];
    /** Mint of the Collection */
    collectionMint: TAccountMetas[3];
    /** Metadata Account of the Collection */
    collectionMetadata?: TAccountMetas[4] | undefined;
    /** Master Edition Account of the Collection Token */
    collectionMasterEdition?: TAccountMetas[5] | undefined;
    /** System program */
    systemProgram: TAccountMetas[6];
    /** Instructions sysvar account */
    sysvarInstructions: TAccountMetas[7];
  };
  data: VerifyCollectionV1InstructionData;
};

export function parseVerifyCollectionV1Instruction<
  TProgram extends string,
  TAccountMetas extends readonly IAccountMeta[]
>(
  instruction: IInstruction<TProgram> &
    IInstructionWithAccounts<TAccountMetas> &
    IInstructionWithData<Uint8Array>
): ParsedVerifyCollectionV1Instruction<TProgram, TAccountMetas> {
  if (instruction.accounts.length < 8) {
    // TODO: Coded error.
    throw new Error('Not enough accounts');
  }
  let accountIndex = 0;
  const getNextAccount = () => {
    const accountMeta = instruction.accounts![accountIndex]!;
    accountIndex += 1;
    return accountMeta;
  };
  const getNextOptionalAccount = () => {
    const accountMeta = getNextAccount();
    return accountMeta.address === 'metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s'
      ? undefined
      : accountMeta;
  };
  return {
    programAddress: instruction.programAddress,
    accounts: {
      authority: getNextAccount(),
      delegateRecord: getNextOptionalAccount(),
      metadata: getNextAccount(),
      collectionMint: getNextAccount(),
      collectionMetadata: getNextOptionalAccount(),
      collectionMasterEdition: getNextOptionalAccount(),
      systemProgram: getNextAccount(),
      sysvarInstructions: getNextAccount(),
    },
    data: getVerifyCollectionV1InstructionDataDecoder().decode(
      instruction.data
    ),
  };
}
