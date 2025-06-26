import { Keypair, PublicKey } from "@solana/web3.js";
import chai, { expect } from "chai";
import chaiAsPromised from "chai-as-promised";
import {
  buildAndSendTx,
  testInitWLAuthority,
  TEST_PROVIDER,
  waitMS,
  wlSdk,
} from "../shared";

chai.use(chaiAsPromised);

describe("tensor whitelist", () => {
  let authPda: PublicKey;
  let tlistOwner: Keypair;

  // inits authority
  before(async () => {
    ({ authPda, tlistOwner } = await testInitWLAuthority());
  });

  it("updates authority", async () => {
    //update (good)
    const tempAuth = Keypair.generate();
    const {
      tx: { ixs: updateGood },
    } = await wlSdk.initUpdateAuthority({
      cosigner: TEST_PROVIDER.publicKey,
      owner: tlistOwner.publicKey,
      newCosigner: tempAuth.publicKey,
      newOwner: tempAuth.publicKey,
    });
    await buildAndSendTx({ ixs: updateGood, extraSigners: [tlistOwner] });

    let authAcc = await wlSdk.fetchAuthority(authPda);
    expect(authAcc.cosigner.toBase58()).to.eq(tempAuth.publicKey.toBase58());
    expect(authAcc.owner.toBase58()).to.eq(tempAuth.publicKey.toBase58());

    // Wait a bit since we previously sent the exact same tx above
    // and w/ the same blockhash this will be duplicate.
    await waitMS(1000);

    const desiredNewOwnerAndAuth = {
      newCosigner: TEST_PROVIDER.publicKey,
      newOwner: tlistOwner.publicKey,
    };

    //update (bad - provider no longer current owner, should fail)
    const {
      tx: { ixs: updateBad },
    } = await wlSdk.initUpdateAuthority({
      cosigner: TEST_PROVIDER.publicKey, //<-- this is wrong
      owner: tempAuth.publicKey,
      ...desiredNewOwnerAndAuth,
    });
    await expect(
      buildAndSendTx({
        ixs: updateBad,
        extraSigners: [tempAuth],
      })
    ).to.be.rejectedWith("0x1770");

    //update (bad - provider no longer current authority, should fail)
    const {
      tx: { ixs: updateBad2 },
    } = await wlSdk.initUpdateAuthority({
      cosigner: tempAuth.publicKey,
      owner: tlistOwner.publicKey, //<-- this is wrong
      ...desiredNewOwnerAndAuth,
    });
    await expect(
      buildAndSendTx({
        ixs: updateBad2,
        extraSigners: [tempAuth, tlistOwner],
      })
    ).to.be.rejectedWith("0x1775");

    //update (good again - transfer back)
    const {
      tx: { ixs: updateGood2 },
    } = await wlSdk.initUpdateAuthority({
      cosigner: tempAuth.publicKey,
      owner: tempAuth.publicKey,
      ...desiredNewOwnerAndAuth,
    });
    await buildAndSendTx({
      ixs: updateGood2,
      extraSigners: [tempAuth],
    });

    authAcc = await wlSdk.fetchAuthority(authPda);
    expect(authAcc.cosigner.toBase58()).to.eq(
      TEST_PROVIDER.publicKey.toBase58()
    );
    expect(authAcc.owner.toBase58()).to.eq(tlistOwner.publicKey.toBase58());
  });

});
