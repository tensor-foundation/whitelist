/**
 * This code was AUTOGENERATED using the kinobi library.
 * Please DO NOT EDIT THIS FILE, instead use visitors
 * to add features, then rerun kinobi to update it.
 *
 * @see https://github.com/metaplex-foundation/kinobi
 */

import {
  Account,
  EncodedAccount,
  FetchAccountConfig,
  FetchAccountsConfig,
  MaybeAccount,
  MaybeEncodedAccount,
  assertAccountExists,
  assertAccountsExist,
  decodeAccount,
  fetchEncodedAccount,
  fetchEncodedAccounts,
} from '@solana/accounts';
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
  getBytesDecoder,
  getBytesEncoder,
  getStructDecoder,
  getStructEncoder,
} from '@solana/codecs-data-structures';
import { getU8Decoder, getU8Encoder } from '@solana/codecs-numbers';
import { MintProofSeeds, findMintProofPda } from '../pdas';

export type MintProof<TAddress extends string = string> = Account<
  MintProofAccountData,
  TAddress
>;

export type MaybeMintProof<TAddress extends string = string> = MaybeAccount<
  MintProofAccountData,
  TAddress
>;

export type MintProofAccountData = {
  discriminator: Array<number>;
  proofLen: number;
  proof: Array<Uint8Array>;
};

export type MintProofAccountDataArgs = {
  proofLen: number;
  proof: Array<Uint8Array>;
};

export function getMintProofAccountDataEncoder(): Encoder<MintProofAccountDataArgs> {
  return mapEncoder(
    getStructEncoder([
      ['discriminator', getArrayEncoder(getU8Encoder(), { size: 8 })],
      ['proofLen', getU8Encoder()],
      ['proof', getArrayEncoder(getBytesEncoder({ size: 32 }), { size: 28 })],
    ]),
    (value) => ({
      ...value,
      discriminator: [227, 131, 106, 240, 190, 48, 219, 228],
    })
  );
}

export function getMintProofAccountDataDecoder(): Decoder<MintProofAccountData> {
  return getStructDecoder([
    ['discriminator', getArrayDecoder(getU8Decoder(), { size: 8 })],
    ['proofLen', getU8Decoder()],
    ['proof', getArrayDecoder(getBytesDecoder({ size: 32 }), { size: 28 })],
  ]);
}

export function getMintProofAccountDataCodec(): Codec<
  MintProofAccountDataArgs,
  MintProofAccountData
> {
  return combineCodec(
    getMintProofAccountDataEncoder(),
    getMintProofAccountDataDecoder()
  );
}

export function decodeMintProof<TAddress extends string = string>(
  encodedAccount: EncodedAccount<TAddress>
): MintProof<TAddress>;
export function decodeMintProof<TAddress extends string = string>(
  encodedAccount: MaybeEncodedAccount<TAddress>
): MaybeMintProof<TAddress>;
export function decodeMintProof<TAddress extends string = string>(
  encodedAccount: EncodedAccount<TAddress> | MaybeEncodedAccount<TAddress>
): MintProof<TAddress> | MaybeMintProof<TAddress> {
  return decodeAccount(
    encodedAccount as MaybeEncodedAccount<TAddress>,
    getMintProofAccountDataDecoder()
  );
}

export async function fetchMintProof<TAddress extends string = string>(
  rpc: Parameters<typeof fetchEncodedAccount>[0],
  address: Address<TAddress>,
  config?: FetchAccountConfig
): Promise<MintProof<TAddress>> {
  const maybeAccount = await fetchMaybeMintProof(rpc, address, config);
  assertAccountExists(maybeAccount);
  return maybeAccount;
}

export async function fetchMaybeMintProof<TAddress extends string = string>(
  rpc: Parameters<typeof fetchEncodedAccount>[0],
  address: Address<TAddress>,
  config?: FetchAccountConfig
): Promise<MaybeMintProof<TAddress>> {
  const maybeAccount = await fetchEncodedAccount(rpc, address, config);
  return decodeMintProof(maybeAccount);
}

export async function fetchAllMintProof(
  rpc: Parameters<typeof fetchEncodedAccounts>[0],
  addresses: Array<Address>,
  config?: FetchAccountsConfig
): Promise<MintProof[]> {
  const maybeAccounts = await fetchAllMaybeMintProof(rpc, addresses, config);
  assertAccountsExist(maybeAccounts);
  return maybeAccounts;
}

export async function fetchAllMaybeMintProof(
  rpc: Parameters<typeof fetchEncodedAccounts>[0],
  addresses: Array<Address>,
  config?: FetchAccountsConfig
): Promise<MaybeMintProof[]> {
  const maybeAccounts = await fetchEncodedAccounts(rpc, addresses, config);
  return maybeAccounts.map((maybeAccount) => decodeMintProof(maybeAccount));
}

export function getMintProofSize(): number {
  return 28;
}

export async function fetchMintProofFromSeeds(
  rpc: Parameters<typeof fetchEncodedAccount>[0],
  seeds: MintProofSeeds,
  config: FetchAccountConfig & { programAddress?: Address } = {}
): Promise<MintProof> {
  const maybeAccount = await fetchMaybeMintProofFromSeeds(rpc, seeds, config);
  assertAccountExists(maybeAccount);
  return maybeAccount;
}

export async function fetchMaybeMintProofFromSeeds(
  rpc: Parameters<typeof fetchEncodedAccount>[0],
  seeds: MintProofSeeds,
  config: FetchAccountConfig & { programAddress?: Address } = {}
): Promise<MaybeMintProof> {
  const { programAddress, ...fetchConfig } = config;
  const [address] = await findMintProofPda(seeds, { programAddress });
  return fetchMaybeMintProof(rpc, address, fetchConfig);
}
