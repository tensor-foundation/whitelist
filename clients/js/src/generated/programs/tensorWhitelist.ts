/**
 * This code was AUTOGENERATED using the kinobi library.
 * Please DO NOT EDIT THIS FILE, instead use visitors
 * to add features, then rerun kinobi to update it.
 *
 * @see https://github.com/metaplex-foundation/kinobi
 */

import { Address } from '@solana/addresses';
import { Program, ProgramWithErrors } from '@solana/programs';
import {
  TensorWhitelistProgramError,
  TensorWhitelistProgramErrorCode,
  getTensorWhitelistProgramErrorFromCode,
} from '../errors';
import { memcmp } from '../shared';

export const TENSOR_WHITELIST_PROGRAM_ADDRESS =
  'TL1ST2iRBzuGTqLn1KXnGdSnEow62BzPnGiqyRXhWtW' as Address<'TL1ST2iRBzuGTqLn1KXnGdSnEow62BzPnGiqyRXhWtW'>;

export type TensorWhitelistProgram =
  Program<'TL1ST2iRBzuGTqLn1KXnGdSnEow62BzPnGiqyRXhWtW'> &
    ProgramWithErrors<
      TensorWhitelistProgramErrorCode,
      TensorWhitelistProgramError
    >;

export function getTensorWhitelistProgram(): TensorWhitelistProgram {
  return {
    name: 'tensorWhitelist',
    address: TENSOR_WHITELIST_PROGRAM_ADDRESS,
    getErrorFromCode(code: TensorWhitelistProgramErrorCode, cause?: Error) {
      return getTensorWhitelistProgramErrorFromCode(code, cause);
    },
  };
}

export enum TensorWhitelistAccount {
  Authority,
  MintProof,
  WhitelistV2,
  Whitelist,
}

export function identifyTensorWhitelistAccount(
  account: { data: Uint8Array } | Uint8Array
): TensorWhitelistAccount {
  const data = account instanceof Uint8Array ? account : account.data;
  if (memcmp(data, new Uint8Array([36, 108, 254, 18, 167, 144, 27, 36]), 0)) {
    return TensorWhitelistAccount.Authority;
  }
  if (
    memcmp(data, new Uint8Array([227, 131, 106, 240, 190, 48, 219, 228]), 0)
  ) {
    return TensorWhitelistAccount.MintProof;
  }
  if (memcmp(data, new Uint8Array([136, 184, 45, 191, 85, 203, 191, 119]), 0)) {
    return TensorWhitelistAccount.WhitelistV2;
  }
  if (memcmp(data, new Uint8Array([204, 176, 52, 79, 146, 121, 54, 247]), 0)) {
    return TensorWhitelistAccount.Whitelist;
  }
  throw new Error(
    'The provided account could not be identified as a tensorWhitelist account.'
  );
}

export enum TensorWhitelistInstruction {
  FreezeWhitelist,
  InitUpdateAuthority,
  InitUpdateMintProof,
  InitUpdateWhitelist,
  ReallocAuthority,
  ReallocWhitelist,
  UnfreezeWhitelist,
  CreateWhitelistV2,
}

export function identifyTensorWhitelistInstruction(
  instruction: { data: Uint8Array } | Uint8Array
): TensorWhitelistInstruction {
  const data =
    instruction instanceof Uint8Array ? instruction : instruction.data;
  if (memcmp(data, new Uint8Array([248, 112, 12, 150, 175, 238, 38, 184]), 0)) {
    return TensorWhitelistInstruction.FreezeWhitelist;
  }
  if (memcmp(data, new Uint8Array([53, 144, 79, 150, 196, 110, 22, 55]), 0)) {
    return TensorWhitelistInstruction.InitUpdateAuthority;
  }
  if (memcmp(data, new Uint8Array([30, 77, 123, 9, 191, 37, 52, 159]), 0)) {
    return TensorWhitelistInstruction.InitUpdateMintProof;
  }
  if (memcmp(data, new Uint8Array([255, 1, 192, 134, 111, 49, 212, 131]), 0)) {
    return TensorWhitelistInstruction.InitUpdateWhitelist;
  }
  if (memcmp(data, new Uint8Array([128, 120, 16, 197, 85, 34, 2, 91]), 0)) {
    return TensorWhitelistInstruction.ReallocAuthority;
  }
  if (memcmp(data, new Uint8Array([173, 147, 168, 152, 181, 46, 55, 60]), 0)) {
    return TensorWhitelistInstruction.ReallocWhitelist;
  }
  if (memcmp(data, new Uint8Array([215, 119, 9, 92, 160, 139, 226, 253]), 0)) {
    return TensorWhitelistInstruction.UnfreezeWhitelist;
  }
  if (memcmp(data, new Uint8Array([31, 207, 213, 77, 105, 13, 127, 98]), 0)) {
    return TensorWhitelistInstruction.CreateWhitelistV2;
  }
  throw new Error(
    'The provided instruction could not be identified as a tensorWhitelist instruction.'
  );
}
