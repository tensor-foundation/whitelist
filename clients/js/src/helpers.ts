import {
  Address,
  getAddressDecoder,
  getAddressEncoder,
} from '@solana/addresses';
import { WhitelistSeeds, findWhitelistPda } from './generated';

export type NumberData = number[] | Uint8Array | Buffer;

export const intoAddress = (data: NumberData): Address => {
  const decoder = getAddressDecoder();
  return decoder.decode(Uint8Array.from(data));
};

export const fromAddress = (address: Address): Uint8Array => {
  const encoder = getAddressEncoder();
  return encoder.encode(address);
};

export async function getWhitelistFromCollId(collId: string): Promise<Address> {
  const uuid = Buffer.from(collId.split("-").join(""));
  const whitelistSeeds: WhitelistSeeds = {
      uuid: uuid
  };
  const [whitelistPDA] = await findWhitelistPda(whitelistSeeds);
  return whitelistPDA;
}