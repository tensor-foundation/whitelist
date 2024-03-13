/**
 * This code was AUTOGENERATED using the kinobi library.
 * Please DO NOT EDIT THIS FILE, instead use visitors
 * to add features, then rerun kinobi to update it.
 *
 * @see https://github.com/metaplex-foundation/kinobi
 */

import { Codec, Decoder, Encoder, combineCodec } from '@solana/codecs-core';
import {
  getScalarEnumDecoder,
  getScalarEnumEncoder,
} from '@solana/codecs-data-structures';

export enum Mode {
  Empty,
  VOC,
  FVC,
  MerkleProof,
}

export type ModeArgs = Mode;

export function getModeEncoder() {
  return getScalarEnumEncoder(Mode) satisfies Encoder<ModeArgs>;
}

export function getModeDecoder() {
  return getScalarEnumDecoder(Mode) satisfies Decoder<Mode>;
}

export function getModeCodec(): Codec<ModeArgs, Mode> {
  return combineCodec(getModeEncoder(), getModeDecoder());
}
