/**
 * This code was AUTOGENERATED using the kinobi library.
 * Please DO NOT EDIT THIS FILE, instead use visitors
 * to add features, then rerun kinobi to update it.
 *
 * @see https://github.com/kinobi-so/kinobi
 */

import {
  Address,
  ProgramDerivedAddress,
  getAddressEncoder,
  getProgramDerivedAddress,
  getUtf8Encoder,
} from '@solana/web3.js';

export type MintProofV2Seeds = {
  /** The address of the mint account */
  mint: Address;
  /** The address of the whitelist pda */
  whitelist: Address;
};

export async function findMintProofV2Pda(
  seeds: MintProofV2Seeds,
  config: { programAddress?: Address | undefined } = {}
): Promise<ProgramDerivedAddress> {
  const {
    programAddress = 'TL1ST2iRBzuGTqLn1KXnGdSnEow62BzPnGiqyRXhWtW' as Address<'TL1ST2iRBzuGTqLn1KXnGdSnEow62BzPnGiqyRXhWtW'>,
  } = config;
  return await getProgramDerivedAddress({
    programAddress,
    seeds: [
      getUtf8Encoder().encode('mint_proof_v2'),
      getAddressEncoder().encode(seeds.mint),
      getAddressEncoder().encode(seeds.whitelist),
    ],
  });
}
