/**
 * This code was AUTOGENERATED using the kinobi library.
 * Please DO NOT EDIT THIS FILE, instead use visitors
 * to add features, then rerun kinobi to update it.
 *
 * @see https://github.com/kinobi-so/kinobi
 */

import {
  combineCodec,
  getEnumDecoder,
  getEnumEncoder,
  type Codec,
  type Decoder,
  type Encoder,
} from '@solana/web3.js';

/** Mode enum for whitelist conditions. */
export enum Mode {
  MerkleTree,
  VOC,
  FVC,
}

export type ModeArgs = Mode;

export function getModeEncoder(): Encoder<ModeArgs> {
  return getEnumEncoder(Mode);
}

export function getModeDecoder(): Decoder<Mode> {
  return getEnumDecoder(Mode);
}

export function getModeCodec(): Codec<ModeArgs, Mode> {
  return combineCodec(getModeEncoder(), getModeDecoder());
}
