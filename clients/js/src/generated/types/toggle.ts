/**
 * This code was AUTOGENERATED using the kinobi library.
 * Please DO NOT EDIT THIS FILE, instead use visitors
 * to add features, then rerun kinobi to update it.
 *
 * @see https://github.com/metaplex-foundation/kinobi
 */

import {
  Address,
  getAddressDecoder,
  getAddressEncoder,
} from '@solana/addresses';
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

export type Toggle =
  | { __kind: 'None' }
  | { __kind: 'Clear' }
  | { __kind: 'Set'; fields: [Address] };

export type ToggleArgs = Toggle;

export function getToggleEncoder() {
  return getDataEnumEncoder<ToggleArgs>([
    ['None', getUnitEncoder()],
    ['Clear', getUnitEncoder()],
    [
      'Set',
      getStructEncoder<GetDataEnumKindContent<ToggleArgs, 'Set'>>([
        ['fields', getTupleEncoder([getAddressEncoder()])],
      ]),
    ],
  ]) satisfies Encoder<ToggleArgs>;
}

export function getToggleDecoder() {
  return getDataEnumDecoder<Toggle>([
    ['None', getUnitDecoder()],
    ['Clear', getUnitDecoder()],
    [
      'Set',
      getStructDecoder<GetDataEnumKindContent<Toggle, 'Set'>>([
        ['fields', getTupleDecoder([getAddressDecoder()])],
      ]),
    ],
  ]) satisfies Decoder<Toggle>;
}

export function getToggleCodec(): Codec<ToggleArgs, Toggle> {
  return combineCodec(getToggleEncoder(), getToggleDecoder());
}

// Data Enum Helpers.
export function toggle(kind: 'None'): GetDataEnumKind<ToggleArgs, 'None'>;
export function toggle(kind: 'Clear'): GetDataEnumKind<ToggleArgs, 'Clear'>;
export function toggle(
  kind: 'Set',
  data: GetDataEnumKindContent<ToggleArgs, 'Set'>['fields']
): GetDataEnumKind<ToggleArgs, 'Set'>;
export function toggle<K extends ToggleArgs['__kind']>(
  kind: K,
  data?: any
): Extract<ToggleArgs, { __kind: K }> {
  return Array.isArray(data)
    ? { __kind: kind, fields: data }
    : { __kind: kind, ...(data ?? {}) };
}

export function isToggle<K extends Toggle['__kind']>(
  kind: K,
  value: Toggle
): value is Toggle & { __kind: K } {
  return value.__kind === kind;
}