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
  WritableSignerAccount,
} from '@solana/instructions';
import { IAccountSignerMeta, TransactionSigner } from '@solana/signers';
import {
  ResolvedAccount,
  accountMetaWithDefault,
  getAccountMetasWithSigners,
} from '../shared';
import {
  MintNewEditionFromMasterEditionViaTokenArgs,
  MintNewEditionFromMasterEditionViaTokenArgsArgs,
  getMintNewEditionFromMasterEditionViaTokenArgsDecoder,
  getMintNewEditionFromMasterEditionViaTokenArgsEncoder,
} from '../types';

export type MintNewEditionFromMasterEditionViaVaultProxyInstruction<
  TProgram extends string = 'metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s',
  TAccountNewMetadata extends string | IAccountMeta<string> = string,
  TAccountNewEdition extends string | IAccountMeta<string> = string,
  TAccountMasterEdition extends string | IAccountMeta<string> = string,
  TAccountNewMint extends string | IAccountMeta<string> = string,
  TAccountEditionMarkPda extends string | IAccountMeta<string> = string,
  TAccountNewMintAuthority extends string | IAccountMeta<string> = string,
  TAccountPayer extends string | IAccountMeta<string> = string,
  TAccountVaultAuthority extends string | IAccountMeta<string> = string,
  TAccountSafetyDepositStore extends string | IAccountMeta<string> = string,
  TAccountSafetyDepositBox extends string | IAccountMeta<string> = string,
  TAccountVault extends string | IAccountMeta<string> = string,
  TAccountNewMetadataUpdateAuthority extends
    | string
    | IAccountMeta<string> = string,
  TAccountMetadata extends string | IAccountMeta<string> = string,
  TAccountTokenProgram extends
    | string
    | IAccountMeta<string> = 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
  TAccountTokenVaultProgram extends string | IAccountMeta<string> = string,
  TAccountSystemProgram extends
    | string
    | IAccountMeta<string> = '11111111111111111111111111111111',
  TAccountRent extends string | IAccountMeta<string> | undefined = undefined,
  TRemainingAccounts extends Array<IAccountMeta<string>> = []
> = IInstruction<TProgram> &
  IInstructionWithData<Uint8Array> &
  IInstructionWithAccounts<
    [
      TAccountNewMetadata extends string
        ? WritableAccount<TAccountNewMetadata>
        : TAccountNewMetadata,
      TAccountNewEdition extends string
        ? WritableAccount<TAccountNewEdition>
        : TAccountNewEdition,
      TAccountMasterEdition extends string
        ? WritableAccount<TAccountMasterEdition>
        : TAccountMasterEdition,
      TAccountNewMint extends string
        ? WritableAccount<TAccountNewMint>
        : TAccountNewMint,
      TAccountEditionMarkPda extends string
        ? WritableAccount<TAccountEditionMarkPda>
        : TAccountEditionMarkPda,
      TAccountNewMintAuthority extends string
        ? ReadonlySignerAccount<TAccountNewMintAuthority>
        : TAccountNewMintAuthority,
      TAccountPayer extends string
        ? WritableSignerAccount<TAccountPayer>
        : TAccountPayer,
      TAccountVaultAuthority extends string
        ? ReadonlySignerAccount<TAccountVaultAuthority>
        : TAccountVaultAuthority,
      TAccountSafetyDepositStore extends string
        ? ReadonlyAccount<TAccountSafetyDepositStore>
        : TAccountSafetyDepositStore,
      TAccountSafetyDepositBox extends string
        ? ReadonlyAccount<TAccountSafetyDepositBox>
        : TAccountSafetyDepositBox,
      TAccountVault extends string
        ? ReadonlyAccount<TAccountVault>
        : TAccountVault,
      TAccountNewMetadataUpdateAuthority extends string
        ? ReadonlyAccount<TAccountNewMetadataUpdateAuthority>
        : TAccountNewMetadataUpdateAuthority,
      TAccountMetadata extends string
        ? ReadonlyAccount<TAccountMetadata>
        : TAccountMetadata,
      TAccountTokenProgram extends string
        ? ReadonlyAccount<TAccountTokenProgram>
        : TAccountTokenProgram,
      TAccountTokenVaultProgram extends string
        ? ReadonlyAccount<TAccountTokenVaultProgram>
        : TAccountTokenVaultProgram,
      TAccountSystemProgram extends string
        ? ReadonlyAccount<TAccountSystemProgram>
        : TAccountSystemProgram,
      ...(TAccountRent extends undefined
        ? []
        : [
            TAccountRent extends string
              ? ReadonlyAccount<TAccountRent>
              : TAccountRent
          ]),
      ...TRemainingAccounts
    ]
  >;

export type MintNewEditionFromMasterEditionViaVaultProxyInstructionWithSigners<
  TProgram extends string = 'metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s',
  TAccountNewMetadata extends string | IAccountMeta<string> = string,
  TAccountNewEdition extends string | IAccountMeta<string> = string,
  TAccountMasterEdition extends string | IAccountMeta<string> = string,
  TAccountNewMint extends string | IAccountMeta<string> = string,
  TAccountEditionMarkPda extends string | IAccountMeta<string> = string,
  TAccountNewMintAuthority extends string | IAccountMeta<string> = string,
  TAccountPayer extends string | IAccountMeta<string> = string,
  TAccountVaultAuthority extends string | IAccountMeta<string> = string,
  TAccountSafetyDepositStore extends string | IAccountMeta<string> = string,
  TAccountSafetyDepositBox extends string | IAccountMeta<string> = string,
  TAccountVault extends string | IAccountMeta<string> = string,
  TAccountNewMetadataUpdateAuthority extends
    | string
    | IAccountMeta<string> = string,
  TAccountMetadata extends string | IAccountMeta<string> = string,
  TAccountTokenProgram extends
    | string
    | IAccountMeta<string> = 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
  TAccountTokenVaultProgram extends string | IAccountMeta<string> = string,
  TAccountSystemProgram extends
    | string
    | IAccountMeta<string> = '11111111111111111111111111111111',
  TAccountRent extends string | IAccountMeta<string> | undefined = undefined,
  TRemainingAccounts extends Array<IAccountMeta<string>> = []
> = IInstruction<TProgram> &
  IInstructionWithData<Uint8Array> &
  IInstructionWithAccounts<
    [
      TAccountNewMetadata extends string
        ? WritableAccount<TAccountNewMetadata>
        : TAccountNewMetadata,
      TAccountNewEdition extends string
        ? WritableAccount<TAccountNewEdition>
        : TAccountNewEdition,
      TAccountMasterEdition extends string
        ? WritableAccount<TAccountMasterEdition>
        : TAccountMasterEdition,
      TAccountNewMint extends string
        ? WritableAccount<TAccountNewMint>
        : TAccountNewMint,
      TAccountEditionMarkPda extends string
        ? WritableAccount<TAccountEditionMarkPda>
        : TAccountEditionMarkPda,
      TAccountNewMintAuthority extends string
        ? ReadonlySignerAccount<TAccountNewMintAuthority> &
            IAccountSignerMeta<TAccountNewMintAuthority>
        : TAccountNewMintAuthority,
      TAccountPayer extends string
        ? WritableSignerAccount<TAccountPayer> &
            IAccountSignerMeta<TAccountPayer>
        : TAccountPayer,
      TAccountVaultAuthority extends string
        ? ReadonlySignerAccount<TAccountVaultAuthority> &
            IAccountSignerMeta<TAccountVaultAuthority>
        : TAccountVaultAuthority,
      TAccountSafetyDepositStore extends string
        ? ReadonlyAccount<TAccountSafetyDepositStore>
        : TAccountSafetyDepositStore,
      TAccountSafetyDepositBox extends string
        ? ReadonlyAccount<TAccountSafetyDepositBox>
        : TAccountSafetyDepositBox,
      TAccountVault extends string
        ? ReadonlyAccount<TAccountVault>
        : TAccountVault,
      TAccountNewMetadataUpdateAuthority extends string
        ? ReadonlyAccount<TAccountNewMetadataUpdateAuthority>
        : TAccountNewMetadataUpdateAuthority,
      TAccountMetadata extends string
        ? ReadonlyAccount<TAccountMetadata>
        : TAccountMetadata,
      TAccountTokenProgram extends string
        ? ReadonlyAccount<TAccountTokenProgram>
        : TAccountTokenProgram,
      TAccountTokenVaultProgram extends string
        ? ReadonlyAccount<TAccountTokenVaultProgram>
        : TAccountTokenVaultProgram,
      TAccountSystemProgram extends string
        ? ReadonlyAccount<TAccountSystemProgram>
        : TAccountSystemProgram,
      ...(TAccountRent extends undefined
        ? []
        : [
            TAccountRent extends string
              ? ReadonlyAccount<TAccountRent>
              : TAccountRent
          ]),
      ...TRemainingAccounts
    ]
  >;

export type MintNewEditionFromMasterEditionViaVaultProxyInstructionData = {
  discriminator: number;
  mintNewEditionFromMasterEditionViaTokenArgs: MintNewEditionFromMasterEditionViaTokenArgs;
};

export type MintNewEditionFromMasterEditionViaVaultProxyInstructionDataArgs = {
  mintNewEditionFromMasterEditionViaTokenArgs: MintNewEditionFromMasterEditionViaTokenArgsArgs;
};

export function getMintNewEditionFromMasterEditionViaVaultProxyInstructionDataEncoder(): Encoder<MintNewEditionFromMasterEditionViaVaultProxyInstructionDataArgs> {
  return mapEncoder(
    getStructEncoder([
      ['discriminator', getU8Encoder()],
      [
        'mintNewEditionFromMasterEditionViaTokenArgs',
        getMintNewEditionFromMasterEditionViaTokenArgsEncoder(),
      ],
    ]),
    (value) => ({ ...value, discriminator: 13 })
  );
}

export function getMintNewEditionFromMasterEditionViaVaultProxyInstructionDataDecoder(): Decoder<MintNewEditionFromMasterEditionViaVaultProxyInstructionData> {
  return getStructDecoder([
    ['discriminator', getU8Decoder()],
    [
      'mintNewEditionFromMasterEditionViaTokenArgs',
      getMintNewEditionFromMasterEditionViaTokenArgsDecoder(),
    ],
  ]);
}

export function getMintNewEditionFromMasterEditionViaVaultProxyInstructionDataCodec(): Codec<
  MintNewEditionFromMasterEditionViaVaultProxyInstructionDataArgs,
  MintNewEditionFromMasterEditionViaVaultProxyInstructionData
> {
  return combineCodec(
    getMintNewEditionFromMasterEditionViaVaultProxyInstructionDataEncoder(),
    getMintNewEditionFromMasterEditionViaVaultProxyInstructionDataDecoder()
  );
}

export type MintNewEditionFromMasterEditionViaVaultProxyInput<
  TAccountNewMetadata extends string,
  TAccountNewEdition extends string,
  TAccountMasterEdition extends string,
  TAccountNewMint extends string,
  TAccountEditionMarkPda extends string,
  TAccountNewMintAuthority extends string,
  TAccountPayer extends string,
  TAccountVaultAuthority extends string,
  TAccountSafetyDepositStore extends string,
  TAccountSafetyDepositBox extends string,
  TAccountVault extends string,
  TAccountNewMetadataUpdateAuthority extends string,
  TAccountMetadata extends string,
  TAccountTokenProgram extends string,
  TAccountTokenVaultProgram extends string,
  TAccountSystemProgram extends string,
  TAccountRent extends string
> = {
  /** New Metadata key (pda of ['metadata', program id, mint id]) */
  newMetadata: Address<TAccountNewMetadata>;
  /** New Edition (pda of ['metadata', program id, mint id, 'edition']) */
  newEdition: Address<TAccountNewEdition>;
  /** Master Record Edition V2 (pda of ['metadata', program id, master metadata mint id, 'edition'] */
  masterEdition: Address<TAccountMasterEdition>;
  /** Mint of new token - THIS WILL TRANSFER AUTHORITY AWAY FROM THIS KEY */
  newMint: Address<TAccountNewMint>;
  /** Edition pda to mark creation - will be checked for pre-existence. (pda of ['metadata', program id, master metadata mint id, 'edition', edition_number]) where edition_number is NOT the edition number you pass in args but actually edition_number = floor(edition/EDITION_MARKER_BIT_SIZE). */
  editionMarkPda: Address<TAccountEditionMarkPda>;
  /** Mint authority of new mint */
  newMintAuthority: Address<TAccountNewMintAuthority>;
  /** payer */
  payer: Address<TAccountPayer>;
  /** Vault authority */
  vaultAuthority: Address<TAccountVaultAuthority>;
  /** Safety deposit token store account */
  safetyDepositStore: Address<TAccountSafetyDepositStore>;
  /** Safety deposit box */
  safetyDepositBox: Address<TAccountSafetyDepositBox>;
  /** Vault */
  vault: Address<TAccountVault>;
  /** Update authority info for new metadata */
  newMetadataUpdateAuthority: Address<TAccountNewMetadataUpdateAuthority>;
  /** Master record metadata account */
  metadata: Address<TAccountMetadata>;
  /** Token program */
  tokenProgram?: Address<TAccountTokenProgram>;
  /** Token vault program */
  tokenVaultProgram: Address<TAccountTokenVaultProgram>;
  /** System program */
  systemProgram?: Address<TAccountSystemProgram>;
  /** Rent info */
  rent?: Address<TAccountRent>;
  mintNewEditionFromMasterEditionViaTokenArgs: MintNewEditionFromMasterEditionViaVaultProxyInstructionDataArgs['mintNewEditionFromMasterEditionViaTokenArgs'];
};

export type MintNewEditionFromMasterEditionViaVaultProxyInputWithSigners<
  TAccountNewMetadata extends string,
  TAccountNewEdition extends string,
  TAccountMasterEdition extends string,
  TAccountNewMint extends string,
  TAccountEditionMarkPda extends string,
  TAccountNewMintAuthority extends string,
  TAccountPayer extends string,
  TAccountVaultAuthority extends string,
  TAccountSafetyDepositStore extends string,
  TAccountSafetyDepositBox extends string,
  TAccountVault extends string,
  TAccountNewMetadataUpdateAuthority extends string,
  TAccountMetadata extends string,
  TAccountTokenProgram extends string,
  TAccountTokenVaultProgram extends string,
  TAccountSystemProgram extends string,
  TAccountRent extends string
> = {
  /** New Metadata key (pda of ['metadata', program id, mint id]) */
  newMetadata: Address<TAccountNewMetadata>;
  /** New Edition (pda of ['metadata', program id, mint id, 'edition']) */
  newEdition: Address<TAccountNewEdition>;
  /** Master Record Edition V2 (pda of ['metadata', program id, master metadata mint id, 'edition'] */
  masterEdition: Address<TAccountMasterEdition>;
  /** Mint of new token - THIS WILL TRANSFER AUTHORITY AWAY FROM THIS KEY */
  newMint: Address<TAccountNewMint>;
  /** Edition pda to mark creation - will be checked for pre-existence. (pda of ['metadata', program id, master metadata mint id, 'edition', edition_number]) where edition_number is NOT the edition number you pass in args but actually edition_number = floor(edition/EDITION_MARKER_BIT_SIZE). */
  editionMarkPda: Address<TAccountEditionMarkPda>;
  /** Mint authority of new mint */
  newMintAuthority: TransactionSigner<TAccountNewMintAuthority>;
  /** payer */
  payer: TransactionSigner<TAccountPayer>;
  /** Vault authority */
  vaultAuthority: TransactionSigner<TAccountVaultAuthority>;
  /** Safety deposit token store account */
  safetyDepositStore: Address<TAccountSafetyDepositStore>;
  /** Safety deposit box */
  safetyDepositBox: Address<TAccountSafetyDepositBox>;
  /** Vault */
  vault: Address<TAccountVault>;
  /** Update authority info for new metadata */
  newMetadataUpdateAuthority: Address<TAccountNewMetadataUpdateAuthority>;
  /** Master record metadata account */
  metadata: Address<TAccountMetadata>;
  /** Token program */
  tokenProgram?: Address<TAccountTokenProgram>;
  /** Token vault program */
  tokenVaultProgram: Address<TAccountTokenVaultProgram>;
  /** System program */
  systemProgram?: Address<TAccountSystemProgram>;
  /** Rent info */
  rent?: Address<TAccountRent>;
  mintNewEditionFromMasterEditionViaTokenArgs: MintNewEditionFromMasterEditionViaVaultProxyInstructionDataArgs['mintNewEditionFromMasterEditionViaTokenArgs'];
};

export function getMintNewEditionFromMasterEditionViaVaultProxyInstruction<
  TAccountNewMetadata extends string,
  TAccountNewEdition extends string,
  TAccountMasterEdition extends string,
  TAccountNewMint extends string,
  TAccountEditionMarkPda extends string,
  TAccountNewMintAuthority extends string,
  TAccountPayer extends string,
  TAccountVaultAuthority extends string,
  TAccountSafetyDepositStore extends string,
  TAccountSafetyDepositBox extends string,
  TAccountVault extends string,
  TAccountNewMetadataUpdateAuthority extends string,
  TAccountMetadata extends string,
  TAccountTokenProgram extends string,
  TAccountTokenVaultProgram extends string,
  TAccountSystemProgram extends string,
  TAccountRent extends string,
  TProgram extends string = 'metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s'
>(
  input: MintNewEditionFromMasterEditionViaVaultProxyInputWithSigners<
    TAccountNewMetadata,
    TAccountNewEdition,
    TAccountMasterEdition,
    TAccountNewMint,
    TAccountEditionMarkPda,
    TAccountNewMintAuthority,
    TAccountPayer,
    TAccountVaultAuthority,
    TAccountSafetyDepositStore,
    TAccountSafetyDepositBox,
    TAccountVault,
    TAccountNewMetadataUpdateAuthority,
    TAccountMetadata,
    TAccountTokenProgram,
    TAccountTokenVaultProgram,
    TAccountSystemProgram,
    TAccountRent
  >
): MintNewEditionFromMasterEditionViaVaultProxyInstructionWithSigners<
  TProgram,
  TAccountNewMetadata,
  TAccountNewEdition,
  TAccountMasterEdition,
  TAccountNewMint,
  TAccountEditionMarkPda,
  TAccountNewMintAuthority,
  TAccountPayer,
  TAccountVaultAuthority,
  TAccountSafetyDepositStore,
  TAccountSafetyDepositBox,
  TAccountVault,
  TAccountNewMetadataUpdateAuthority,
  TAccountMetadata,
  TAccountTokenProgram,
  TAccountTokenVaultProgram,
  TAccountSystemProgram,
  TAccountRent
>;
export function getMintNewEditionFromMasterEditionViaVaultProxyInstruction<
  TAccountNewMetadata extends string,
  TAccountNewEdition extends string,
  TAccountMasterEdition extends string,
  TAccountNewMint extends string,
  TAccountEditionMarkPda extends string,
  TAccountNewMintAuthority extends string,
  TAccountPayer extends string,
  TAccountVaultAuthority extends string,
  TAccountSafetyDepositStore extends string,
  TAccountSafetyDepositBox extends string,
  TAccountVault extends string,
  TAccountNewMetadataUpdateAuthority extends string,
  TAccountMetadata extends string,
  TAccountTokenProgram extends string,
  TAccountTokenVaultProgram extends string,
  TAccountSystemProgram extends string,
  TAccountRent extends string,
  TProgram extends string = 'metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s'
>(
  input: MintNewEditionFromMasterEditionViaVaultProxyInput<
    TAccountNewMetadata,
    TAccountNewEdition,
    TAccountMasterEdition,
    TAccountNewMint,
    TAccountEditionMarkPda,
    TAccountNewMintAuthority,
    TAccountPayer,
    TAccountVaultAuthority,
    TAccountSafetyDepositStore,
    TAccountSafetyDepositBox,
    TAccountVault,
    TAccountNewMetadataUpdateAuthority,
    TAccountMetadata,
    TAccountTokenProgram,
    TAccountTokenVaultProgram,
    TAccountSystemProgram,
    TAccountRent
  >
): MintNewEditionFromMasterEditionViaVaultProxyInstruction<
  TProgram,
  TAccountNewMetadata,
  TAccountNewEdition,
  TAccountMasterEdition,
  TAccountNewMint,
  TAccountEditionMarkPda,
  TAccountNewMintAuthority,
  TAccountPayer,
  TAccountVaultAuthority,
  TAccountSafetyDepositStore,
  TAccountSafetyDepositBox,
  TAccountVault,
  TAccountNewMetadataUpdateAuthority,
  TAccountMetadata,
  TAccountTokenProgram,
  TAccountTokenVaultProgram,
  TAccountSystemProgram,
  TAccountRent
>;
export function getMintNewEditionFromMasterEditionViaVaultProxyInstruction<
  TAccountNewMetadata extends string,
  TAccountNewEdition extends string,
  TAccountMasterEdition extends string,
  TAccountNewMint extends string,
  TAccountEditionMarkPda extends string,
  TAccountNewMintAuthority extends string,
  TAccountPayer extends string,
  TAccountVaultAuthority extends string,
  TAccountSafetyDepositStore extends string,
  TAccountSafetyDepositBox extends string,
  TAccountVault extends string,
  TAccountNewMetadataUpdateAuthority extends string,
  TAccountMetadata extends string,
  TAccountTokenProgram extends string,
  TAccountTokenVaultProgram extends string,
  TAccountSystemProgram extends string,
  TAccountRent extends string,
  TProgram extends string = 'metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s'
>(
  input: MintNewEditionFromMasterEditionViaVaultProxyInput<
    TAccountNewMetadata,
    TAccountNewEdition,
    TAccountMasterEdition,
    TAccountNewMint,
    TAccountEditionMarkPda,
    TAccountNewMintAuthority,
    TAccountPayer,
    TAccountVaultAuthority,
    TAccountSafetyDepositStore,
    TAccountSafetyDepositBox,
    TAccountVault,
    TAccountNewMetadataUpdateAuthority,
    TAccountMetadata,
    TAccountTokenProgram,
    TAccountTokenVaultProgram,
    TAccountSystemProgram,
    TAccountRent
  >
): IInstruction {
  // Program address.
  const programAddress =
    'metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s' as Address<'metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s'>;

  // Original accounts.
  type AccountMetas = Parameters<
    typeof getMintNewEditionFromMasterEditionViaVaultProxyInstructionRaw<
      TProgram,
      TAccountNewMetadata,
      TAccountNewEdition,
      TAccountMasterEdition,
      TAccountNewMint,
      TAccountEditionMarkPda,
      TAccountNewMintAuthority,
      TAccountPayer,
      TAccountVaultAuthority,
      TAccountSafetyDepositStore,
      TAccountSafetyDepositBox,
      TAccountVault,
      TAccountNewMetadataUpdateAuthority,
      TAccountMetadata,
      TAccountTokenProgram,
      TAccountTokenVaultProgram,
      TAccountSystemProgram,
      TAccountRent
    >
  >[0];
  const accounts: Record<keyof AccountMetas, ResolvedAccount> = {
    newMetadata: { value: input.newMetadata ?? null, isWritable: true },
    newEdition: { value: input.newEdition ?? null, isWritable: true },
    masterEdition: { value: input.masterEdition ?? null, isWritable: true },
    newMint: { value: input.newMint ?? null, isWritable: true },
    editionMarkPda: { value: input.editionMarkPda ?? null, isWritable: true },
    newMintAuthority: {
      value: input.newMintAuthority ?? null,
      isWritable: false,
    },
    payer: { value: input.payer ?? null, isWritable: true },
    vaultAuthority: { value: input.vaultAuthority ?? null, isWritable: false },
    safetyDepositStore: {
      value: input.safetyDepositStore ?? null,
      isWritable: false,
    },
    safetyDepositBox: {
      value: input.safetyDepositBox ?? null,
      isWritable: false,
    },
    vault: { value: input.vault ?? null, isWritable: false },
    newMetadataUpdateAuthority: {
      value: input.newMetadataUpdateAuthority ?? null,
      isWritable: false,
    },
    metadata: { value: input.metadata ?? null, isWritable: false },
    tokenProgram: { value: input.tokenProgram ?? null, isWritable: false },
    tokenVaultProgram: {
      value: input.tokenVaultProgram ?? null,
      isWritable: false,
    },
    systemProgram: { value: input.systemProgram ?? null, isWritable: false },
    rent: { value: input.rent ?? null, isWritable: false },
  };

  // Original args.
  const args = { ...input };

  // Resolve default values.
  if (!accounts.tokenProgram.value) {
    accounts.tokenProgram.value =
      'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA' as Address<'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'>;
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

  const instruction =
    getMintNewEditionFromMasterEditionViaVaultProxyInstructionRaw(
      accountMetas as Record<keyof AccountMetas, IAccountMeta>,
      args as MintNewEditionFromMasterEditionViaVaultProxyInstructionDataArgs,
      programAddress
    );

  return instruction;
}

export function getMintNewEditionFromMasterEditionViaVaultProxyInstructionRaw<
  TProgram extends string = 'metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s',
  TAccountNewMetadata extends string | IAccountMeta<string> = string,
  TAccountNewEdition extends string | IAccountMeta<string> = string,
  TAccountMasterEdition extends string | IAccountMeta<string> = string,
  TAccountNewMint extends string | IAccountMeta<string> = string,
  TAccountEditionMarkPda extends string | IAccountMeta<string> = string,
  TAccountNewMintAuthority extends string | IAccountMeta<string> = string,
  TAccountPayer extends string | IAccountMeta<string> = string,
  TAccountVaultAuthority extends string | IAccountMeta<string> = string,
  TAccountSafetyDepositStore extends string | IAccountMeta<string> = string,
  TAccountSafetyDepositBox extends string | IAccountMeta<string> = string,
  TAccountVault extends string | IAccountMeta<string> = string,
  TAccountNewMetadataUpdateAuthority extends
    | string
    | IAccountMeta<string> = string,
  TAccountMetadata extends string | IAccountMeta<string> = string,
  TAccountTokenProgram extends
    | string
    | IAccountMeta<string> = 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
  TAccountTokenVaultProgram extends string | IAccountMeta<string> = string,
  TAccountSystemProgram extends
    | string
    | IAccountMeta<string> = '11111111111111111111111111111111',
  TAccountRent extends string | IAccountMeta<string> | undefined = undefined,
  TRemainingAccounts extends Array<IAccountMeta<string>> = []
>(
  accounts: {
    newMetadata: TAccountNewMetadata extends string
      ? Address<TAccountNewMetadata>
      : TAccountNewMetadata;
    newEdition: TAccountNewEdition extends string
      ? Address<TAccountNewEdition>
      : TAccountNewEdition;
    masterEdition: TAccountMasterEdition extends string
      ? Address<TAccountMasterEdition>
      : TAccountMasterEdition;
    newMint: TAccountNewMint extends string
      ? Address<TAccountNewMint>
      : TAccountNewMint;
    editionMarkPda: TAccountEditionMarkPda extends string
      ? Address<TAccountEditionMarkPda>
      : TAccountEditionMarkPda;
    newMintAuthority: TAccountNewMintAuthority extends string
      ? Address<TAccountNewMintAuthority>
      : TAccountNewMintAuthority;
    payer: TAccountPayer extends string
      ? Address<TAccountPayer>
      : TAccountPayer;
    vaultAuthority: TAccountVaultAuthority extends string
      ? Address<TAccountVaultAuthority>
      : TAccountVaultAuthority;
    safetyDepositStore: TAccountSafetyDepositStore extends string
      ? Address<TAccountSafetyDepositStore>
      : TAccountSafetyDepositStore;
    safetyDepositBox: TAccountSafetyDepositBox extends string
      ? Address<TAccountSafetyDepositBox>
      : TAccountSafetyDepositBox;
    vault: TAccountVault extends string
      ? Address<TAccountVault>
      : TAccountVault;
    newMetadataUpdateAuthority: TAccountNewMetadataUpdateAuthority extends string
      ? Address<TAccountNewMetadataUpdateAuthority>
      : TAccountNewMetadataUpdateAuthority;
    metadata: TAccountMetadata extends string
      ? Address<TAccountMetadata>
      : TAccountMetadata;
    tokenProgram?: TAccountTokenProgram extends string
      ? Address<TAccountTokenProgram>
      : TAccountTokenProgram;
    tokenVaultProgram: TAccountTokenVaultProgram extends string
      ? Address<TAccountTokenVaultProgram>
      : TAccountTokenVaultProgram;
    systemProgram?: TAccountSystemProgram extends string
      ? Address<TAccountSystemProgram>
      : TAccountSystemProgram;
    rent?: TAccountRent extends string ? Address<TAccountRent> : TAccountRent;
  },
  args: MintNewEditionFromMasterEditionViaVaultProxyInstructionDataArgs,
  programAddress: Address<TProgram> = 'metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s' as Address<TProgram>,
  remainingAccounts?: TRemainingAccounts
) {
  return {
    accounts: [
      accountMetaWithDefault(accounts.newMetadata, AccountRole.WRITABLE),
      accountMetaWithDefault(accounts.newEdition, AccountRole.WRITABLE),
      accountMetaWithDefault(accounts.masterEdition, AccountRole.WRITABLE),
      accountMetaWithDefault(accounts.newMint, AccountRole.WRITABLE),
      accountMetaWithDefault(accounts.editionMarkPda, AccountRole.WRITABLE),
      accountMetaWithDefault(
        accounts.newMintAuthority,
        AccountRole.READONLY_SIGNER
      ),
      accountMetaWithDefault(accounts.payer, AccountRole.WRITABLE_SIGNER),
      accountMetaWithDefault(
        accounts.vaultAuthority,
        AccountRole.READONLY_SIGNER
      ),
      accountMetaWithDefault(accounts.safetyDepositStore, AccountRole.READONLY),
      accountMetaWithDefault(accounts.safetyDepositBox, AccountRole.READONLY),
      accountMetaWithDefault(accounts.vault, AccountRole.READONLY),
      accountMetaWithDefault(
        accounts.newMetadataUpdateAuthority,
        AccountRole.READONLY
      ),
      accountMetaWithDefault(accounts.metadata, AccountRole.READONLY),
      accountMetaWithDefault(
        accounts.tokenProgram ??
          ('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA' as Address<'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'>),
        AccountRole.READONLY
      ),
      accountMetaWithDefault(accounts.tokenVaultProgram, AccountRole.READONLY),
      accountMetaWithDefault(
        accounts.systemProgram ??
          ('11111111111111111111111111111111' as Address<'11111111111111111111111111111111'>),
        AccountRole.READONLY
      ),
      accountMetaWithDefault(accounts.rent, AccountRole.READONLY),
      ...(remainingAccounts ?? []),
    ].filter(<T>(x: T | undefined): x is T => x !== undefined),
    data: getMintNewEditionFromMasterEditionViaVaultProxyInstructionDataEncoder().encode(
      args
    ),
    programAddress,
  } as MintNewEditionFromMasterEditionViaVaultProxyInstruction<
    TProgram,
    TAccountNewMetadata,
    TAccountNewEdition,
    TAccountMasterEdition,
    TAccountNewMint,
    TAccountEditionMarkPda,
    TAccountNewMintAuthority,
    TAccountPayer,
    TAccountVaultAuthority,
    TAccountSafetyDepositStore,
    TAccountSafetyDepositBox,
    TAccountVault,
    TAccountNewMetadataUpdateAuthority,
    TAccountMetadata,
    TAccountTokenProgram,
    TAccountTokenVaultProgram,
    TAccountSystemProgram,
    TAccountRent,
    TRemainingAccounts
  >;
}

export type ParsedMintNewEditionFromMasterEditionViaVaultProxyInstruction<
  TProgram extends string = 'metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s',
  TAccountMetas extends readonly IAccountMeta[] = readonly IAccountMeta[]
> = {
  programAddress: Address<TProgram>;
  accounts: {
    /** New Metadata key (pda of ['metadata', program id, mint id]) */
    newMetadata: TAccountMetas[0];
    /** New Edition (pda of ['metadata', program id, mint id, 'edition']) */
    newEdition: TAccountMetas[1];
    /** Master Record Edition V2 (pda of ['metadata', program id, master metadata mint id, 'edition'] */
    masterEdition: TAccountMetas[2];
    /** Mint of new token - THIS WILL TRANSFER AUTHORITY AWAY FROM THIS KEY */
    newMint: TAccountMetas[3];
    /** Edition pda to mark creation - will be checked for pre-existence. (pda of ['metadata', program id, master metadata mint id, 'edition', edition_number]) where edition_number is NOT the edition number you pass in args but actually edition_number = floor(edition/EDITION_MARKER_BIT_SIZE). */
    editionMarkPda: TAccountMetas[4];
    /** Mint authority of new mint */
    newMintAuthority: TAccountMetas[5];
    /** payer */
    payer: TAccountMetas[6];
    /** Vault authority */
    vaultAuthority: TAccountMetas[7];
    /** Safety deposit token store account */
    safetyDepositStore: TAccountMetas[8];
    /** Safety deposit box */
    safetyDepositBox: TAccountMetas[9];
    /** Vault */
    vault: TAccountMetas[10];
    /** Update authority info for new metadata */
    newMetadataUpdateAuthority: TAccountMetas[11];
    /** Master record metadata account */
    metadata: TAccountMetas[12];
    /** Token program */
    tokenProgram: TAccountMetas[13];
    /** Token vault program */
    tokenVaultProgram: TAccountMetas[14];
    /** System program */
    systemProgram: TAccountMetas[15];
    /** Rent info */
    rent?: TAccountMetas[16] | undefined;
  };
  data: MintNewEditionFromMasterEditionViaVaultProxyInstructionData;
};

export function parseMintNewEditionFromMasterEditionViaVaultProxyInstruction<
  TProgram extends string,
  TAccountMetas extends readonly IAccountMeta[]
>(
  instruction: IInstruction<TProgram> &
    IInstructionWithAccounts<TAccountMetas> &
    IInstructionWithData<Uint8Array>
): ParsedMintNewEditionFromMasterEditionViaVaultProxyInstruction<
  TProgram,
  TAccountMetas
> {
  if (instruction.accounts.length < 16) {
    // TODO: Coded error.
    throw new Error('Not enough accounts');
  }
  let accountIndex = 0;
  const getNextAccount = () => {
    const accountMeta = instruction.accounts![accountIndex]!;
    accountIndex += 1;
    return accountMeta;
  };
  let optionalAccountsRemaining = instruction.accounts.length - 16;
  const getNextOptionalAccount = () => {
    if (optionalAccountsRemaining === 0) return undefined;
    optionalAccountsRemaining -= 1;
    return getNextAccount();
  };
  return {
    programAddress: instruction.programAddress,
    accounts: {
      newMetadata: getNextAccount(),
      newEdition: getNextAccount(),
      masterEdition: getNextAccount(),
      newMint: getNextAccount(),
      editionMarkPda: getNextAccount(),
      newMintAuthority: getNextAccount(),
      payer: getNextAccount(),
      vaultAuthority: getNextAccount(),
      safetyDepositStore: getNextAccount(),
      safetyDepositBox: getNextAccount(),
      vault: getNextAccount(),
      newMetadataUpdateAuthority: getNextAccount(),
      metadata: getNextAccount(),
      tokenProgram: getNextAccount(),
      tokenVaultProgram: getNextAccount(),
      systemProgram: getNextAccount(),
      rent: getNextOptionalAccount(),
    },
    data: getMintNewEditionFromMasterEditionViaVaultProxyInstructionDataDecoder().decode(
      instruction.data
    ),
  };
}
