import { PublicKey } from "@solana/web3.js";
import { TENSORSWAP_ADDR } from "./constants";
import { BN } from "@project-serum/anchor";

export const findPoolPDA = async ({
  program,
  tSwap,
  creator,
  whitelist,
  poolType,
  curveType,
  startingPrice,
  delta,
}: {
  program?: PublicKey;
  tSwap: PublicKey;
  creator: PublicKey;
  whitelist: PublicKey;
  poolType: number;
  curveType: number;
  startingPrice: BN;
  delta: BN;
}): Promise<[PublicKey, number]> => {
  return PublicKey.findProgramAddress(
    [
      tSwap.toBytes(),
      creator.toBytes(),
      whitelist.toBytes(),
      //u8s, hence 1 byte each
      new BN(poolType).toBuffer("le", 1),
      new BN(curveType).toBuffer("le", 1),
      //u64s, hence 8 bytes each
      startingPrice.toBuffer("le", 8),
      delta.toBuffer("le", 8),
    ],
    program ?? TENSORSWAP_ADDR
  );
};

export const findSwapAuthPDA = async ({
  program,
  tSwap,
}: {
  program?: PublicKey;
  tSwap: PublicKey;
}) => {
  return PublicKey.findProgramAddress(
    [tSwap.toBytes()],
    program ?? TENSORSWAP_ADDR
  );
};

export const findNftEscrowPDA = async ({
  program,
  nftMint,
}: {
  program?: PublicKey;
  nftMint: PublicKey;
}) => {
  return PublicKey.findProgramAddress(
    [Buffer.from("nft_escrow"), nftMint.toBytes()],
    program ?? TENSORSWAP_ADDR
  );
};

export const findNftDepositReceiptPDA = async ({
  program,
  nftMint,
}: {
  program?: PublicKey;
  nftMint: PublicKey;
}) => {
  return PublicKey.findProgramAddress(
    [Buffer.from("nft_receipt"), nftMint.toBytes()],
    program ?? TENSORSWAP_ADDR
  );
};

export const findSolEscrowPDA = async ({
  program,
  pool,
}: {
  program?: PublicKey;
  pool: PublicKey;
}) => {
  return PublicKey.findProgramAddress(
    [Buffer.from("sol_escrow"), pool.toBytes()],
    program ?? TENSORSWAP_ADDR
  );
};
