/**
 * This code was AUTOGENERATED using the kinobi library.
 * Please DO NOT EDIT THIS FILE, instead use visitors
 * to add features, then rerun kinobi to update it.
 *
 * @see https://github.com/kinobi-so/kinobi
 */

import {
  Address,
  Codec,
  Decoder,
  Encoder,
  combineCodec,
  getAddressDecoder,
  getAddressEncoder,
  getStructDecoder,
  getStructEncoder,
} from '@solana/web3.js';
import { Mode, ModeArgs, getModeDecoder, getModeEncoder } from '.';

/**
 * Defines a whitelist condition that items are checked against.
 * Conditions are made up of a mode and a value.
 * The mode determines what kind of value is present to be validated against.
 * The value is the data used to validate against the whitelist.
 *
 * Current modes:
 * - MerkleTree: The value is the root node of a Merkle tree.
 * - VOC: The value is the Metaplex "verified-on-chain"/Metaplex Certified Collection address.
 * - FVC: The value is the first verified creator address of the Metaplex creators metadata.
 */

export type Condition = { mode: Mode; value: Address };

export type ConditionArgs = { mode: ModeArgs; value: Address };

export function getConditionEncoder(): Encoder<ConditionArgs> {
  return getStructEncoder([
    ['mode', getModeEncoder()],
    ['value', getAddressEncoder()],
  ]);
}

export function getConditionDecoder(): Decoder<Condition> {
  return getStructDecoder([
    ['mode', getModeDecoder()],
    ['value', getAddressDecoder()],
  ]);
}

export function getConditionCodec(): Codec<ConditionArgs, Condition> {
  return combineCodec(getConditionEncoder(), getConditionDecoder());
}
