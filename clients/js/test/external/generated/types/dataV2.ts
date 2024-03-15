/**
 * This code was AUTOGENERATED using the kinobi library.
 * Please DO NOT EDIT THIS FILE, instead use visitors
 * to add features, then rerun kinobi to update it.
 *
 * @see https://github.com/metaplex-foundation/kinobi
 */

import { Codec, Decoder, Encoder, combineCodec } from '@solana/codecs-core';
import {
  getArrayDecoder,
  getArrayEncoder,
  getStructDecoder,
  getStructEncoder,
} from '@solana/codecs-data-structures';
import { getU16Decoder, getU16Encoder } from '@solana/codecs-numbers';
import { getStringDecoder, getStringEncoder } from '@solana/codecs-strings';
import {
  Option,
  OptionOrNullable,
  getOptionDecoder,
  getOptionEncoder,
} from '@solana/options';
import {
  Collection,
  CollectionArgs,
  Creator,
  CreatorArgs,
  Uses,
  UsesArgs,
  getCollectionDecoder,
  getCollectionEncoder,
  getCreatorDecoder,
  getCreatorEncoder,
  getUsesDecoder,
  getUsesEncoder,
} from '.';

export type DataV2 = {
  name: string;
  symbol: string;
  uri: string;
  sellerFeeBasisPoints: number;
  creators: Option<Array<Creator>>;
  collection: Option<Collection>;
  uses: Option<Uses>;
};

export type DataV2Args = {
  name: string;
  symbol: string;
  uri: string;
  sellerFeeBasisPoints: number;
  creators: OptionOrNullable<Array<CreatorArgs>>;
  collection: OptionOrNullable<CollectionArgs>;
  uses: OptionOrNullable<UsesArgs>;
};

export function getDataV2Encoder(): Encoder<DataV2Args> {
  return getStructEncoder([
    ['name', getStringEncoder()],
    ['symbol', getStringEncoder()],
    ['uri', getStringEncoder()],
    ['sellerFeeBasisPoints', getU16Encoder()],
    ['creators', getOptionEncoder(getArrayEncoder(getCreatorEncoder()))],
    ['collection', getOptionEncoder(getCollectionEncoder())],
    ['uses', getOptionEncoder(getUsesEncoder())],
  ]);
}

export function getDataV2Decoder(): Decoder<DataV2> {
  return getStructDecoder([
    ['name', getStringDecoder()],
    ['symbol', getStringDecoder()],
    ['uri', getStringDecoder()],
    ['sellerFeeBasisPoints', getU16Decoder()],
    ['creators', getOptionDecoder(getArrayDecoder(getCreatorDecoder()))],
    ['collection', getOptionDecoder(getCollectionDecoder())],
    ['uses', getOptionDecoder(getUsesDecoder())],
  ]);
}

export function getDataV2Codec(): Codec<DataV2Args, DataV2> {
  return combineCodec(getDataV2Encoder(), getDataV2Decoder());
}
