import {
  Address,
  ReadonlyUint8Array,
  getAddressDecoder,
  getAddressEncoder,
} from '@solana/web3.js';
import { WhitelistSeeds, findWhitelistPda } from './generated';

export type NumberData = number[] | Uint8Array | Buffer;

export const intoAddress = (data: NumberData): Address => {
  const decoder = getAddressDecoder();
  return decoder.decode(Uint8Array.from(data));
};

export const fromAddress = (address: Address): ReadonlyUint8Array => {
  const encoder = getAddressEncoder();
  return encoder.encode(address);
};

export const collIdToBuffer = (collId: string) => {
  return Buffer.from(collId.split('-').join(''));
};

export const bufferToCollId = (buffer: number[]) => {
  const raw = String.fromCharCode(...buffer);
  return `${raw.slice(0, 8)}-${raw.slice(8, 12)}-${raw.slice(
    12,
    16
  )}-${raw.slice(16, 20)}-${raw.slice(20)}`;
};

export async function getWhitelistFromCollId(collId: string): Promise<Address> {
  const uuid = collIdToBuffer(collId);
  const whitelistSeeds: WhitelistSeeds = {
    uuid: uuid,
  };
  const [whitelistPda] = await findWhitelistPda(whitelistSeeds);
  return whitelistPda;
}
