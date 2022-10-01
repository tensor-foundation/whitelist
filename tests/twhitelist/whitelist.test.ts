import { Keypair, PublicKey } from "@solana/web3.js";
import chai, { expect } from "chai";
import chaiAsPromised from "chai-as-promised";
import { TensorWhitelistSDK } from "../../src";
import {
  buildAndSendTx,
  generateTreeOfSize,
  testInitWLAuthority,
  TEST_PROVIDER,
  waitMS,
  wlSdk,
} from "../shared";

chai.use(chaiAsPromised);

describe("tensor_whitelist WL auth and create", () => {
  let authPda: PublicKey;

  // inits authority
  before(async () => {
    authPda = await testInitWLAuthority();
  });

  it("updates authority", async () => {
    //update (good)
    const tempAuth = Keypair.generate();
    const {
      tx: { ixs: updateGood },
    } = await wlSdk.initUpdateAuthority(
      TEST_PROVIDER.publicKey,
      tempAuth.publicKey
    );
    await buildAndSendTx({ ixs: updateGood });

    let authAcc = await wlSdk.fetchAuthority(authPda);
    authAcc = await wlSdk.fetchAuthority(authPda);
    expect(authAcc.owner.toBase58()).to.eq(tempAuth.publicKey.toBase58());

    // Wait a bit since we previously sent the exact same tx above
    // and w/ the same blockhash this will be duplicate.
    await waitMS(1000);
    //update (bad - provider no longer current owner, should fail)
    const {
      tx: { ixs: updateBad },
    } = await wlSdk.initUpdateAuthority(
      TEST_PROVIDER.publicKey,
      TEST_PROVIDER.publicKey
    );
    await expect(buildAndSendTx({ ixs: updateBad })).to.be.rejectedWith(
      "0x1770"
    );

    //update (good again - transfer back)
    const {
      tx: { ixs: updateGood2 },
    } = await wlSdk.initUpdateAuthority(
      tempAuth.publicKey,
      TEST_PROVIDER.publicKey
    );
    await buildAndSendTx({
      ixs: updateGood2,
      extraSigners: [tempAuth],
    });

    authAcc = await wlSdk.fetchAuthority(authPda);
    expect(authAcc.owner.toBase58()).to.eq(TEST_PROVIDER.publicKey.toBase58());
  });

  // ---------------------------- Whitelist creation

  it("inits/updates whitelist", async () => {
    //fail init'ing a whitelist w/o name or root hash
    const uuid = wlSdk.genWhitelistUUID();
    const uuidBuffer = TensorWhitelistSDK.uuidToBuffer(uuid);
    const name = "hello_world";
    const nameBuffer = TensorWhitelistSDK.nameToBuffer(name);
    expect(uuidBuffer.length).to.eq(32);
    expect(nameBuffer.length).to.eq(32);
    const { root } = generateTreeOfSize(100, [Keypair.generate().publicKey]);

    const {
      tx: { ixs: initWlBad },
    } = await wlSdk.initUpdateWhitelist({
      owner: TEST_PROVIDER.publicKey,
      uuid: uuidBuffer,
    });
    await expect(buildAndSendTx({ ixs: initWlBad })).to.be.rejectedWith(
      "0x1771"
    );

    const {
      tx: { ixs: initWlBad2 },
    } = await wlSdk.initUpdateWhitelist({
      owner: TEST_PROVIDER.publicKey,
      uuid: uuidBuffer,
      rootHash: root,
    });
    await expect(buildAndSendTx({ ixs: initWlBad2 })).to.be.rejectedWith(
      "0x1772"
    );

    //init ok
    const {
      tx: { ixs: initWlGood },
      whitelistPda,
    } = await wlSdk.initUpdateWhitelist({
      owner: TEST_PROVIDER.publicKey,
      uuid: uuidBuffer,
      rootHash: root,
      name: nameBuffer,
    });
    await buildAndSendTx({ ixs: initWlGood });

    let wlAcc = await wlSdk.fetchWhitelist(whitelistPda);
    expect(TensorWhitelistSDK.bufferToUuid(wlAcc.uuid)).to.eq(uuid);
    expect(TensorWhitelistSDK.bufferToName(wlAcc.name)).to.eq(name);
    expect(wlAcc.rootHash).to.deep.eq(root);

    //update ok
    const uuid2 = wlSdk.genWhitelistUUID();
    const name2 = "hello_world2222";
    const { root: root2 } = generateTreeOfSize(100, [
      Keypair.generate().publicKey,
    ]);

    const {
      tx: { ixs: initWlGood2 },
      whitelistPda: whitelistPda2,
    } = await wlSdk.initUpdateWhitelist({
      owner: TEST_PROVIDER.publicKey,
      uuid: TensorWhitelistSDK.uuidToBuffer(uuid2),
      rootHash: root2,
      name: TensorWhitelistSDK.nameToBuffer(name2),
    });
    await buildAndSendTx({ ixs: initWlGood2 });

    wlAcc = await wlSdk.fetchWhitelist(whitelistPda2);
    expect(TensorWhitelistSDK.bufferToUuid(wlAcc.uuid)).to.eq(uuid2);
    expect(TensorWhitelistSDK.bufferToName(wlAcc.name)).to.eq(name2);
    expect(wlAcc.rootHash).to.deep.eq(root2);
  });
});