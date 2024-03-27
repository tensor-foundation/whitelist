/**
 * This code was AUTOGENERATED using the kinobi library.
 * Please DO NOT EDIT THIS FILE, instead use visitors
 * to add features, then rerun kinobi to update it.
 *
 * @see https://github.com/metaplex-foundation/kinobi
 */

import {
  Address,
  ProgramDerivedAddress,
  getAddressEncoder,
  getProgramDerivedAddress,
} from '@solana/addresses';
import { getBytesEncoder, getStringEncoder } from '@solana/codecs';

export type WhitelistV2Seeds = {
  /** The namespace address */
  namespace: Address;
  /** UUID of the whitelist */
  uuid: Uint8Array;
};

export async function findWhitelistV2Pda(
  seeds: WhitelistV2Seeds,
  config: { programAddress?: Address | undefined } = {}
): Promise<ProgramDerivedAddress> {
  const {
    programAddress = 'TL1ST2iRBzuGTqLn1KXnGdSnEow62BzPnGiqyRXhWtW' as Address<'TL1ST2iRBzuGTqLn1KXnGdSnEow62BzPnGiqyRXhWtW'>,
  } = config;
  return getProgramDerivedAddress({
    programAddress,
    seeds: [
      getStringEncoder({ size: 'variable' }).encode('whitelist'),
      getAddressEncoder().encode(seeds.namespace),
      getBytesEncoder({ size: 32 }).encode(seeds.uuid),
    ],
  });
}
