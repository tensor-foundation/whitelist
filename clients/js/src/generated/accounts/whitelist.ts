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
  Option,
  OptionOrNullable,
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
  getBooleanDecoder,
  getBooleanEncoder,
  getBytesDecoder,
  getBytesEncoder,
  getOptionDecoder,
  getOptionEncoder,
  getStructDecoder,
  getStructEncoder,
  getU8Decoder,
  getU8Encoder,
  transformEncoder,
} from '@solana/web3.js';
import { WhitelistSeeds, findWhitelistPda } from '../pdas';

export type Whitelist = {
  discriminator: ReadonlyUint8Array;
  version: number;
  bump: number;
  /** DEPRECATED, doesn't do anything */
  verified: boolean;
  /** in the case when not present will be [u8; 32] */
  rootHash: ReadonlyUint8Array;
  uuid: ReadonlyUint8Array;
  name: ReadonlyUint8Array;
  frozen: boolean;
  voc: Option<Address>;
  fvc: Option<Address>;
  reserved: ReadonlyUint8Array;
};

export type WhitelistArgs = {
  version: number;
  bump: number;
  /** DEPRECATED, doesn't do anything */
  verified: boolean;
  /** in the case when not present will be [u8; 32] */
  rootHash: ReadonlyUint8Array;
  uuid: ReadonlyUint8Array;
  name: ReadonlyUint8Array;
  frozen: boolean;
  voc: OptionOrNullable<Address>;
  fvc: OptionOrNullable<Address>;
  reserved: ReadonlyUint8Array;
};

export function getWhitelistEncoder(): Encoder<WhitelistArgs> {
  return transformEncoder(
    getStructEncoder([
      ['discriminator', fixEncoderSize(getBytesEncoder(), 8)],
      ['version', getU8Encoder()],
      ['bump', getU8Encoder()],
      ['verified', getBooleanEncoder()],
      ['rootHash', fixEncoderSize(getBytesEncoder(), 32)],
      ['uuid', fixEncoderSize(getBytesEncoder(), 32)],
      ['name', fixEncoderSize(getBytesEncoder(), 32)],
      ['frozen', getBooleanEncoder()],
      ['voc', getOptionEncoder(getAddressEncoder())],
      ['fvc', getOptionEncoder(getAddressEncoder())],
      ['reserved', fixEncoderSize(getBytesEncoder(), 64)],
    ]),
    (value) => ({
      ...value,
      discriminator: new Uint8Array([204, 176, 52, 79, 146, 121, 54, 247]),
    })
  );
}

export function getWhitelistDecoder(): Decoder<Whitelist> {
  return getStructDecoder([
    ['discriminator', fixDecoderSize(getBytesDecoder(), 8)],
    ['version', getU8Decoder()],
    ['bump', getU8Decoder()],
    ['verified', getBooleanDecoder()],
    ['rootHash', fixDecoderSize(getBytesDecoder(), 32)],
    ['uuid', fixDecoderSize(getBytesDecoder(), 32)],
    ['name', fixDecoderSize(getBytesDecoder(), 32)],
    ['frozen', getBooleanDecoder()],
    ['voc', getOptionDecoder(getAddressDecoder())],
    ['fvc', getOptionDecoder(getAddressDecoder())],
    ['reserved', fixDecoderSize(getBytesDecoder(), 64)],
  ]);
}

export function getWhitelistCodec(): Codec<WhitelistArgs, Whitelist> {
  return combineCodec(getWhitelistEncoder(), getWhitelistDecoder());
}

export function decodeWhitelist<TAddress extends string = string>(
  encodedAccount: EncodedAccount<TAddress>
): Account<Whitelist, TAddress>;
export function decodeWhitelist<TAddress extends string = string>(
  encodedAccount: MaybeEncodedAccount<TAddress>
): MaybeAccount<Whitelist, TAddress>;
export function decodeWhitelist<TAddress extends string = string>(
  encodedAccount: EncodedAccount<TAddress> | MaybeEncodedAccount<TAddress>
): Account<Whitelist, TAddress> | MaybeAccount<Whitelist, TAddress> {
  return decodeAccount(
    encodedAccount as MaybeEncodedAccount<TAddress>,
    getWhitelistDecoder()
  );
}

export async function fetchWhitelist<TAddress extends string = string>(
  rpc: Parameters<typeof fetchEncodedAccount>[0],
  address: Address<TAddress>,
  config?: FetchAccountConfig
): Promise<Account<Whitelist, TAddress>> {
  const maybeAccount = await fetchMaybeWhitelist(rpc, address, config);
  assertAccountExists(maybeAccount);
  return maybeAccount;
}

export async function fetchMaybeWhitelist<TAddress extends string = string>(
  rpc: Parameters<typeof fetchEncodedAccount>[0],
  address: Address<TAddress>,
  config?: FetchAccountConfig
): Promise<MaybeAccount<Whitelist, TAddress>> {
  const maybeAccount = await fetchEncodedAccount(rpc, address, config);
  return decodeWhitelist(maybeAccount);
}

export async function fetchAllWhitelist(
  rpc: Parameters<typeof fetchEncodedAccounts>[0],
  addresses: Array<Address>,
  config?: FetchAccountsConfig
): Promise<Account<Whitelist>[]> {
  const maybeAccounts = await fetchAllMaybeWhitelist(rpc, addresses, config);
  assertAccountsExist(maybeAccounts);
  return maybeAccounts;
}

export async function fetchAllMaybeWhitelist(
  rpc: Parameters<typeof fetchEncodedAccounts>[0],
  addresses: Array<Address>,
  config?: FetchAccountsConfig
): Promise<MaybeAccount<Whitelist>[]> {
  const maybeAccounts = await fetchEncodedAccounts(rpc, addresses, config);
  return maybeAccounts.map((maybeAccount) => decodeWhitelist(maybeAccount));
}

export function getWhitelistSize(): number {
  return 238;
}

export async function fetchWhitelistFromSeeds(
  rpc: Parameters<typeof fetchEncodedAccount>[0],
  seeds: WhitelistSeeds,
  config: FetchAccountConfig & { programAddress?: Address } = {}
): Promise<Account<Whitelist>> {
  const maybeAccount = await fetchMaybeWhitelistFromSeeds(rpc, seeds, config);
  assertAccountExists(maybeAccount);
  return maybeAccount;
}

export async function fetchMaybeWhitelistFromSeeds(
  rpc: Parameters<typeof fetchEncodedAccount>[0],
  seeds: WhitelistSeeds,
  config: FetchAccountConfig & { programAddress?: Address } = {}
): Promise<MaybeAccount<Whitelist>> {
  const { programAddress, ...fetchConfig } = config;
  const [address] = await findWhitelistPda(seeds, { programAddress });
  return await fetchMaybeWhitelist(rpc, address, fetchConfig);
}
