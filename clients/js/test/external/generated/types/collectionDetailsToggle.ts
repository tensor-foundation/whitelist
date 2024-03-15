/**
 * This code was AUTOGENERATED using the kinobi library.
 * Please DO NOT EDIT THIS FILE, instead use visitors
 * to add features, then rerun kinobi to update it.
 *
 * @see https://github.com/metaplex-foundation/kinobi
 */

import { Codec, Decoder, Encoder, combineCodec } from '@solana/codecs-core';
import {
  GetDataEnumKind,
  GetDataEnumKindContent,
  getDataEnumDecoder,
  getDataEnumEncoder,
  getStructDecoder,
  getStructEncoder,
  getTupleDecoder,
  getTupleEncoder,
  getUnitDecoder,
  getUnitEncoder,
} from '@solana/codecs-data-structures';
import {
  CollectionDetails,
  CollectionDetailsArgs,
  getCollectionDetailsDecoder,
  getCollectionDetailsEncoder,
} from '.';

export type CollectionDetailsToggle =
  | { __kind: 'None' }
  | { __kind: 'Clear' }
  | { __kind: 'Set'; fields: [CollectionDetails] };

export type CollectionDetailsToggleArgs =
  | { __kind: 'None' }
  | { __kind: 'Clear' }
  | { __kind: 'Set'; fields: [CollectionDetailsArgs] };

export function getCollectionDetailsToggleEncoder(): Encoder<CollectionDetailsToggleArgs> {
  return getDataEnumEncoder([
    ['None', getUnitEncoder()],
    ['Clear', getUnitEncoder()],
    [
      'Set',
      getStructEncoder([
        ['fields', getTupleEncoder([getCollectionDetailsEncoder()])],
      ]),
    ],
  ]);
}

export function getCollectionDetailsToggleDecoder(): Decoder<CollectionDetailsToggle> {
  return getDataEnumDecoder([
    ['None', getUnitDecoder()],
    ['Clear', getUnitDecoder()],
    [
      'Set',
      getStructDecoder([
        ['fields', getTupleDecoder([getCollectionDetailsDecoder()])],
      ]),
    ],
  ]);
}

export function getCollectionDetailsToggleCodec(): Codec<
  CollectionDetailsToggleArgs,
  CollectionDetailsToggle
> {
  return combineCodec(
    getCollectionDetailsToggleEncoder(),
    getCollectionDetailsToggleDecoder()
  );
}

// Data Enum Helpers.
export function collectionDetailsToggle(
  kind: 'None'
): GetDataEnumKind<CollectionDetailsToggleArgs, 'None'>;
export function collectionDetailsToggle(
  kind: 'Clear'
): GetDataEnumKind<CollectionDetailsToggleArgs, 'Clear'>;
export function collectionDetailsToggle(
  kind: 'Set',
  data: GetDataEnumKindContent<CollectionDetailsToggleArgs, 'Set'>['fields']
): GetDataEnumKind<CollectionDetailsToggleArgs, 'Set'>;
export function collectionDetailsToggle<
  K extends CollectionDetailsToggleArgs['__kind']
>(kind: K, data?: any): Extract<CollectionDetailsToggleArgs, { __kind: K }> {
  return Array.isArray(data)
    ? { __kind: kind, fields: data }
    : { __kind: kind, ...(data ?? {}) };
}

export function isCollectionDetailsToggle<
  K extends CollectionDetailsToggle['__kind']
>(
  kind: K,
  value: CollectionDetailsToggle
): value is CollectionDetailsToggle & { __kind: K } {
  return value.__kind === kind;
}
