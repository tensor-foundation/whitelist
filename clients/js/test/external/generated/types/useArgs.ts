/**
 * This code was AUTOGENERATED using the kinobi library.
 * Please DO NOT EDIT THIS FILE, instead use visitors
 * to add features, then rerun kinobi to update it.
 *
 * @see https://github.com/metaplex-foundation/kinobi
 */

import {
  Codec,
  Decoder,
  Encoder,
  combineCodec,
  mapEncoder,
} from '@solana/codecs-core';
import {
  GetDataEnumKind,
  GetDataEnumKindContent,
  getDataEnumDecoder,
  getDataEnumEncoder,
  getStructDecoder,
  getStructEncoder,
} from '@solana/codecs-data-structures';
import {
  Option,
  OptionOrNullable,
  getOptionDecoder,
  getOptionEncoder,
  none,
} from '@solana/options';
import {
  AuthorizationData,
  AuthorizationDataArgs,
  getAuthorizationDataDecoder,
  getAuthorizationDataEncoder,
} from '.';

export type UseArgs = {
  __kind: 'V1';
  authorizationData: Option<AuthorizationData>;
};

export type UseArgsArgs = {
  __kind: 'V1';
  authorizationData?: OptionOrNullable<AuthorizationDataArgs>;
};

export function getUseArgsEncoder(): Encoder<UseArgsArgs> {
  return getDataEnumEncoder([
    [
      'V1',
      mapEncoder(
        getStructEncoder([
          [
            'authorizationData',
            getOptionEncoder(getAuthorizationDataEncoder()),
          ],
        ]),
        (value) => ({
          ...value,
          authorizationData: value.authorizationData ?? none(),
        })
      ),
    ],
  ]);
}

export function getUseArgsDecoder(): Decoder<UseArgs> {
  return getDataEnumDecoder([
    [
      'V1',
      getStructDecoder([
        ['authorizationData', getOptionDecoder(getAuthorizationDataDecoder())],
      ]),
    ],
  ]);
}

export function getUseArgsCodec(): Codec<UseArgsArgs, UseArgs> {
  return combineCodec(getUseArgsEncoder(), getUseArgsDecoder());
}

// Data Enum Helpers.
export function useArgs(
  kind: 'V1',
  data: GetDataEnumKindContent<UseArgsArgs, 'V1'>
): GetDataEnumKind<UseArgsArgs, 'V1'>;
export function useArgs<K extends UseArgsArgs['__kind']>(
  kind: K,
  data?: any
): Extract<UseArgsArgs, { __kind: K }> {
  return Array.isArray(data)
    ? { __kind: kind, fields: data }
    : { __kind: kind, ...(data ?? {}) };
}

export function isUseArgs<K extends UseArgs['__kind']>(
  kind: K,
  value: UseArgs
): value is UseArgs & { __kind: K } {
  return value.__kind === kind;
}
