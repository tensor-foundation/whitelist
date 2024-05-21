/**
 * This code was AUTOGENERATED using the kinobi library.
 * Please DO NOT EDIT THIS FILE, instead use visitors
 * to add features, then rerun kinobi to update it.
 *
 * @see https://github.com/kinobi-so/kinobi
 */

import {
  Address,
  containsBytes,
  fixEncoderSize,
  getBytesEncoder,
} from '@solana/web3.js';
import {
  ParsedCloseMintProofV2Instruction,
  ParsedCreateMintProofV2Instruction,
  ParsedCreateWhitelistV2Instruction,
  ParsedFreezeWhitelistInstruction,
  ParsedFreezeWhitelistV2Instruction,
  ParsedInitUpdateAuthorityInstruction,
  ParsedInitUpdateMintProofInstruction,
  ParsedInitUpdateWhitelistInstruction,
  ParsedReallocAuthorityInstruction,
  ParsedReallocWhitelistInstruction,
  ParsedUnfreezeWhitelistInstruction,
  ParsedUnfreezeWhitelistV2Instruction,
  ParsedUpdateWhitelistV2Instruction,
} from '../instructions';

export const TENSOR_WHITELIST_PROGRAM_ADDRESS =
  'TL1ST2iRBzuGTqLn1KXnGdSnEow62BzPnGiqyRXhWtW' as Address<'TL1ST2iRBzuGTqLn1KXnGdSnEow62BzPnGiqyRXhWtW'>;

export enum TensorWhitelistAccount {
  Authority,
  MintProofV2,
  MintProof,
  WhitelistV2,
  Whitelist,
}

export function identifyTensorWhitelistAccount(
  account: { data: Uint8Array } | Uint8Array
): TensorWhitelistAccount {
  const data = account instanceof Uint8Array ? account : account.data;
  if (
    containsBytes(
      data,
      fixEncoderSize(getBytesEncoder(), 8).encode(
        new Uint8Array([36, 108, 254, 18, 167, 144, 27, 36])
      ),
      0
    )
  ) {
    return TensorWhitelistAccount.Authority;
  }
  if (
    containsBytes(
      data,
      fixEncoderSize(getBytesEncoder(), 8).encode(
        new Uint8Array([22, 197, 150, 178, 249, 225, 183, 75])
      ),
      0
    )
  ) {
    return TensorWhitelistAccount.MintProofV2;
  }
  if (
    containsBytes(
      data,
      fixEncoderSize(getBytesEncoder(), 8).encode(
        new Uint8Array([227, 131, 106, 240, 190, 48, 219, 228])
      ),
      0
    )
  ) {
    return TensorWhitelistAccount.MintProof;
  }
  if (
    containsBytes(
      data,
      fixEncoderSize(getBytesEncoder(), 8).encode(
        new Uint8Array([136, 184, 45, 191, 85, 203, 191, 119])
      ),
      0
    )
  ) {
    return TensorWhitelistAccount.WhitelistV2;
  }
  if (
    containsBytes(
      data,
      fixEncoderSize(getBytesEncoder(), 8).encode(
        new Uint8Array([204, 176, 52, 79, 146, 121, 54, 247])
      ),
      0
    )
  ) {
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
  UpdateWhitelistV2,
  CreateMintProofV2,
  CloseMintProofV2,
  FreezeWhitelistV2,
  UnfreezeWhitelistV2,
}

export function identifyTensorWhitelistInstruction(
  instruction: { data: Uint8Array } | Uint8Array
): TensorWhitelistInstruction {
  const data =
    instruction instanceof Uint8Array ? instruction : instruction.data;
  if (
    containsBytes(
      data,
      fixEncoderSize(getBytesEncoder(), 8).encode(
        new Uint8Array([248, 112, 12, 150, 175, 238, 38, 184])
      ),
      0
    )
  ) {
    return TensorWhitelistInstruction.FreezeWhitelist;
  }
  if (
    containsBytes(
      data,
      fixEncoderSize(getBytesEncoder(), 8).encode(
        new Uint8Array([53, 144, 79, 150, 196, 110, 22, 55])
      ),
      0
    )
  ) {
    return TensorWhitelistInstruction.InitUpdateAuthority;
  }
  if (
    containsBytes(
      data,
      fixEncoderSize(getBytesEncoder(), 8).encode(
        new Uint8Array([30, 77, 123, 9, 191, 37, 52, 159])
      ),
      0
    )
  ) {
    return TensorWhitelistInstruction.InitUpdateMintProof;
  }
  if (
    containsBytes(
      data,
      fixEncoderSize(getBytesEncoder(), 8).encode(
        new Uint8Array([255, 1, 192, 134, 111, 49, 212, 131])
      ),
      0
    )
  ) {
    return TensorWhitelistInstruction.InitUpdateWhitelist;
  }
  if (
    containsBytes(
      data,
      fixEncoderSize(getBytesEncoder(), 8).encode(
        new Uint8Array([128, 120, 16, 197, 85, 34, 2, 91])
      ),
      0
    )
  ) {
    return TensorWhitelistInstruction.ReallocAuthority;
  }
  if (
    containsBytes(
      data,
      fixEncoderSize(getBytesEncoder(), 8).encode(
        new Uint8Array([173, 147, 168, 152, 181, 46, 55, 60])
      ),
      0
    )
  ) {
    return TensorWhitelistInstruction.ReallocWhitelist;
  }
  if (
    containsBytes(
      data,
      fixEncoderSize(getBytesEncoder(), 8).encode(
        new Uint8Array([215, 119, 9, 92, 160, 139, 226, 253])
      ),
      0
    )
  ) {
    return TensorWhitelistInstruction.UnfreezeWhitelist;
  }
  if (
    containsBytes(
      data,
      fixEncoderSize(getBytesEncoder(), 8).encode(
        new Uint8Array([31, 207, 213, 77, 105, 13, 127, 98])
      ),
      0
    )
  ) {
    return TensorWhitelistInstruction.CreateWhitelistV2;
  }
  if (
    containsBytes(
      data,
      fixEncoderSize(getBytesEncoder(), 8).encode(
        new Uint8Array([184, 188, 157, 214, 205, 49, 74, 226])
      ),
      0
    )
  ) {
    return TensorWhitelistInstruction.UpdateWhitelistV2;
  }
  if (
    containsBytes(
      data,
      fixEncoderSize(getBytesEncoder(), 8).encode(
        new Uint8Array([219, 176, 21, 37, 145, 89, 154, 53])
      ),
      0
    )
  ) {
    return TensorWhitelistInstruction.CreateMintProofV2;
  }
  if (
    containsBytes(
      data,
      fixEncoderSize(getBytesEncoder(), 8).encode(
        new Uint8Array([237, 78, 8, 208, 47, 148, 145, 170])
      ),
      0
    )
  ) {
    return TensorWhitelistInstruction.CloseMintProofV2;
  }
  if (
    containsBytes(
      data,
      fixEncoderSize(getBytesEncoder(), 8).encode(
        new Uint8Array([69, 158, 243, 78, 116, 68, 221, 113])
      ),
      0
    )
  ) {
    return TensorWhitelistInstruction.FreezeWhitelistV2;
  }
  if (
    containsBytes(
      data,
      fixEncoderSize(getBytesEncoder(), 8).encode(
        new Uint8Array([51, 105, 214, 84, 252, 188, 26, 1])
      ),
      0
    )
  ) {
    return TensorWhitelistInstruction.UnfreezeWhitelistV2;
  }
  throw new Error(
    'The provided instruction could not be identified as a tensorWhitelist instruction.'
  );
}

export type ParsedTensorWhitelistInstruction<
  TProgram extends string = 'TL1ST2iRBzuGTqLn1KXnGdSnEow62BzPnGiqyRXhWtW',
> =
  | ({
      instructionType: TensorWhitelistInstruction.FreezeWhitelist;
    } & ParsedFreezeWhitelistInstruction<TProgram>)
  | ({
      instructionType: TensorWhitelistInstruction.InitUpdateAuthority;
    } & ParsedInitUpdateAuthorityInstruction<TProgram>)
  | ({
      instructionType: TensorWhitelistInstruction.InitUpdateMintProof;
    } & ParsedInitUpdateMintProofInstruction<TProgram>)
  | ({
      instructionType: TensorWhitelistInstruction.InitUpdateWhitelist;
    } & ParsedInitUpdateWhitelistInstruction<TProgram>)
  | ({
      instructionType: TensorWhitelistInstruction.ReallocAuthority;
    } & ParsedReallocAuthorityInstruction<TProgram>)
  | ({
      instructionType: TensorWhitelistInstruction.ReallocWhitelist;
    } & ParsedReallocWhitelistInstruction<TProgram>)
  | ({
      instructionType: TensorWhitelistInstruction.UnfreezeWhitelist;
    } & ParsedUnfreezeWhitelistInstruction<TProgram>)
  | ({
      instructionType: TensorWhitelistInstruction.CreateWhitelistV2;
    } & ParsedCreateWhitelistV2Instruction<TProgram>)
  | ({
      instructionType: TensorWhitelistInstruction.UpdateWhitelistV2;
    } & ParsedUpdateWhitelistV2Instruction<TProgram>)
  | ({
      instructionType: TensorWhitelistInstruction.CreateMintProofV2;
    } & ParsedCreateMintProofV2Instruction<TProgram>)
  | ({
      instructionType: TensorWhitelistInstruction.CloseMintProofV2;
    } & ParsedCloseMintProofV2Instruction<TProgram>)
  | ({
      instructionType: TensorWhitelistInstruction.FreezeWhitelistV2;
    } & ParsedFreezeWhitelistV2Instruction<TProgram>)
  | ({
      instructionType: TensorWhitelistInstruction.UnfreezeWhitelistV2;
    } & ParsedUnfreezeWhitelistV2Instruction<TProgram>);
