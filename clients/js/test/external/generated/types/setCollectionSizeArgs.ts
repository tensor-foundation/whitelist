/**
 * This code was AUTOGENERATED using the kinobi library.
 * Please DO NOT EDIT THIS FILE, instead use visitors
 * to add features, then rerun kinobi to update it.
 *
 * @see https://github.com/metaplex-foundation/kinobi
 */

import { Codec, Decoder, Encoder, combineCodec } from '@solana/codecs-core';
import {
  getStructDecoder,
  getStructEncoder,
} from '@solana/codecs-data-structures';
import { getU64Decoder, getU64Encoder } from '@solana/codecs-numbers';

export type SetCollectionSizeArgs = { size: bigint };

export type SetCollectionSizeArgsArgs = { size: number | bigint };

export function getSetCollectionSizeArgsEncoder(): Encoder<SetCollectionSizeArgsArgs> {
  return getStructEncoder([['size', getU64Encoder()]]);
}

export function getSetCollectionSizeArgsDecoder(): Decoder<SetCollectionSizeArgs> {
  return getStructDecoder([['size', getU64Decoder()]]);
}

export function getSetCollectionSizeArgsCodec(): Codec<
  SetCollectionSizeArgsArgs,
  SetCollectionSizeArgs
> {
  return combineCodec(
    getSetCollectionSizeArgsEncoder(),
    getSetCollectionSizeArgsDecoder()
  );
}
