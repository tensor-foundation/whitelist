import { Keypair } from "@solana/web3.js";
import { swapSdk, buildAndSendTx, TSWAP_FEE_ACC } from "../shared";
import chai, { expect } from "chai";
import chaiAsPromised from "chai-as-promised";
import { createFundedWallet, TSWAP_CONFIG } from "./common";

// Enables rejectedWith.
chai.use(chaiAsPromised);

describe("tswap init_update_tswap", () => {
  it("properly checks for owner on further updates", async () => {
    const initialOwner = await createFundedWallet();
    const {
      tx: { ixs },
      tswapPda: tswap,
    } = await swapSdk.initUpdateTSwap({
      owner: initialOwner.publicKey,
      newOwner: initialOwner.publicKey,
      feeVault: TSWAP_FEE_ACC,
      cosigner: initialOwner.publicKey,
      config: TSWAP_CONFIG,
    });
    await buildAndSendTx({ ixs, extraSigners: [initialOwner] });

    let tswapAcc = await swapSdk.fetchTSwap(tswap);
    expect(tswapAcc.owner.toBase58()).eq(initialOwner.publicKey.toBase58());
    expect(tswapAcc.cosigner.toBase58()).eq(initialOwner.publicKey.toBase58());
    expect(tswapAcc.feeVault.toBase58()).eq(TSWAP_FEE_ACC.toBase58());

    const randomOwner = await createFundedWallet();
    const randomFeeAcct = Keypair.generate().publicKey;
    const randomCosigner = Keypair.generate();

    const {
      tx: { ixs: fakeIxs },
    } = await swapSdk.initUpdateTSwap({
      owner: randomOwner.publicKey,
      newOwner: randomOwner.publicKey,
      feeVault: randomFeeAcct,
      cosigner: randomCosigner.publicKey,
      config: TSWAP_CONFIG,
    });
    await expect(
      buildAndSendTx({
        ixs: fakeIxs,
        extraSigners: [randomOwner, randomCosigner],
      })
    ).rejectedWith(swapSdk.getErrorCodeHex("BadTSwapOwner"));

    // Update cosigner + owner works.
    const {
      tx: { ixs: goodIxs },
    } = await swapSdk.initUpdateTSwap({
      owner: initialOwner.publicKey,
      newOwner: randomOwner.publicKey,
      feeVault: randomFeeAcct,
      cosigner: randomCosigner.publicKey,
      config: TSWAP_CONFIG,
    });
    await buildAndSendTx({
      ixs: goodIxs,
      extraSigners: [initialOwner, randomCosigner],
    });
    tswapAcc = await swapSdk.fetchTSwap(tswap);
    expect(tswapAcc.owner.toBase58()).eq(randomOwner.publicKey.toBase58());
    expect(tswapAcc.cosigner.toBase58()).eq(
      randomCosigner.publicKey.toBase58()
    );
    expect(tswapAcc.feeVault.toBase58()).eq(randomFeeAcct.toBase58());
  });
});
