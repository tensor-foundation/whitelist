/**
 * This code was AUTOGENERATED using the codama library.
 * Please DO NOT EDIT THIS FILE, instead use visitors
 * to add features, then rerun codama to update it.
 *
 * @see https://github.com/codama-idl/codama
 */

import {
  combineCodec,
  getEnumDecoder,
  getEnumEncoder,
  type Codec,
  type Decoder,
  type Encoder,
} from '@solana/web3.js';

/** Whitelist state enum. Currently only supports Frozen and Unfrozen. */
export enum State {
  Unfrozen,
  Frozen,
}

export type StateArgs = State;

export function getStateEncoder(): Encoder<StateArgs> {
  return getEnumEncoder(State);
}

export function getStateDecoder(): Decoder<State> {
  return getEnumDecoder(State);
}

export function getStateCodec(): Codec<StateArgs, State> {
  return combineCodec(getStateEncoder(), getStateDecoder());
}
