/**
 * This code was AUTOGENERATED using the kinobi library.
 * Please DO NOT EDIT THIS FILE, instead use visitors
 * to add features, then rerun kinobi to update it.
 *
 * @see https://github.com/kinobi-so/kinobi
 */

import {
  Account,
  Address,
  Codec,
  Decoder,
  EncodedAccount,
  Encoder,
  FetchAccountConfig,
  FetchAccountsConfig,
  MaybeAccount,
  MaybeEncodedAccount,
  ReadonlyUint8Array,
  assertAccountExists,
  assertAccountsExist,
  combineCodec,
  decodeAccount,
  fetchEncodedAccount,
  fetchEncodedAccounts,
  fixDecoderSize,
  fixEncoderSize,
  getAddressDecoder,
  getAddressEncoder,
  getArrayDecoder,
  getArrayEncoder,
  getBytesDecoder,
  getBytesEncoder,
  getStructDecoder,
  getStructEncoder,
  getU64Decoder,
  getU64Encoder,
  getU8Decoder,
  getU8Encoder,
  transformEncoder,
} from '@solana/web3.js';
import { MintProofV2Seeds, findMintProofV2Pda } from '../pdas';

export type MintProofV2 = {
  discriminator: ReadonlyUint8Array;
  proofLen: number;
  proof: Array<ReadonlyUint8Array>;
  creationSlot: bigint;
  payer: Address;
};

export type MintProofV2Args = {
  proofLen: number;
  proof: Array<ReadonlyUint8Array>;
  creationSlot: number | bigint;
  payer: Address;
};

export function getMintProofV2Encoder(): Encoder<MintProofV2Args> {
  return transformEncoder(
    getStructEncoder([
      ['discriminator', fixEncoderSize(getBytesEncoder(), 8)],
      ['proofLen', getU8Encoder()],
      [
        'proof',
        getArrayEncoder(fixEncoderSize(getBytesEncoder(), 32), { size: 28 }),
      ],
      ['creationSlot', getU64Encoder()],
      ['payer', getAddressEncoder()],
    ]),
    (value) => ({
      ...value,
      discriminator: new Uint8Array([22, 197, 150, 178, 249, 225, 183, 75]),
    })
  );
}

export function getMintProofV2Decoder(): Decoder<MintProofV2> {
  return getStructDecoder([
    ['discriminator', fixDecoderSize(getBytesDecoder(), 8)],
    ['proofLen', getU8Decoder()],
    [
      'proof',
      getArrayDecoder(fixDecoderSize(getBytesDecoder(), 32), { size: 28 }),
    ],
    ['creationSlot', getU64Decoder()],
    ['payer', getAddressDecoder()],
  ]);
}

export function getMintProofV2Codec(): Codec<MintProofV2Args, MintProofV2> {
  return combineCodec(getMintProofV2Encoder(), getMintProofV2Decoder());
}

export function decodeMintProofV2<TAddress extends string = string>(
  encodedAccount: EncodedAccount<TAddress>
): Account<MintProofV2, TAddress>;
export function decodeMintProofV2<TAddress extends string = string>(
  encodedAccount: MaybeEncodedAccount<TAddress>
): MaybeAccount<MintProofV2, TAddress>;
export function decodeMintProofV2<TAddress extends string = string>(
  encodedAccount: EncodedAccount<TAddress> | MaybeEncodedAccount<TAddress>
): Account<MintProofV2, TAddress> | MaybeAccount<MintProofV2, TAddress> {
  return decodeAccount(
    encodedAccount as MaybeEncodedAccount<TAddress>,
    getMintProofV2Decoder()
  );
}

export async function fetchMintProofV2<TAddress extends string = string>(
  rpc: Parameters<typeof fetchEncodedAccount>[0],
  address: Address<TAddress>,
  config?: FetchAccountConfig
): Promise<Account<MintProofV2, TAddress>> {
  const maybeAccount = await fetchMaybeMintProofV2(rpc, address, config);
  assertAccountExists(maybeAccount);
  return maybeAccount;
}

export async function fetchMaybeMintProofV2<TAddress extends string = string>(
  rpc: Parameters<typeof fetchEncodedAccount>[0],
  address: Address<TAddress>,
  config?: FetchAccountConfig
): Promise<MaybeAccount<MintProofV2, TAddress>> {
  const maybeAccount = await fetchEncodedAccount(rpc, address, config);
  return decodeMintProofV2(maybeAccount);
}

export async function fetchAllMintProofV2(
  rpc: Parameters<typeof fetchEncodedAccounts>[0],
  addresses: Array<Address>,
  config?: FetchAccountsConfig
): Promise<Account<MintProofV2>[]> {
  const maybeAccounts = await fetchAllMaybeMintProofV2(rpc, addresses, config);
  assertAccountsExist(maybeAccounts);
  return maybeAccounts;
}

export async function fetchAllMaybeMintProofV2(
  rpc: Parameters<typeof fetchEncodedAccounts>[0],
  addresses: Array<Address>,
  config?: FetchAccountsConfig
): Promise<MaybeAccount<MintProofV2>[]> {
  const maybeAccounts = await fetchEncodedAccounts(rpc, addresses, config);
  return maybeAccounts.map((maybeAccount) => decodeMintProofV2(maybeAccount));
}

export function getMintProofV2Size(): number {
  return 945;
}

export async function fetchMintProofV2FromSeeds(
  rpc: Parameters<typeof fetchEncodedAccount>[0],
  seeds: MintProofV2Seeds,
  config: FetchAccountConfig & { programAddress?: Address } = {}
): Promise<Account<MintProofV2>> {
  const maybeAccount = await fetchMaybeMintProofV2FromSeeds(rpc, seeds, config);
  assertAccountExists(maybeAccount);
  return maybeAccount;
}

export async function fetchMaybeMintProofV2FromSeeds(
  rpc: Parameters<typeof fetchEncodedAccount>[0],
  seeds: MintProofV2Seeds,
  config: FetchAccountConfig & { programAddress?: Address } = {}
): Promise<MaybeAccount<MintProofV2>> {
  const { programAddress, ...fetchConfig } = config;
  const [address] = await findMintProofV2Pda(seeds, { programAddress });
  return await fetchMaybeMintProofV2(rpc, address, fetchConfig);
}
