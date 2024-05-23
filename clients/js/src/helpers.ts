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

export async function getWhitelistFromCollId(collId: string): Promise<Address> {
  const uuid = Buffer.from(collId.split('-').join(''));
  const whitelistSeeds: WhitelistSeeds = {
    uuid: uuid,
  };
  const [whitelistPda] = await findWhitelistPda(whitelistSeeds);
  return whitelistPda;
}
