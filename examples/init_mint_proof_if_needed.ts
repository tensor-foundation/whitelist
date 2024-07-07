import {
  createKeyPairSignerFromBytes,
  address,
  Address,
  KeyPairSigner,
  fetchEncodedAccount,
  getAddressEncoder,
  getAddressDecoder,
  assertAccountExists,
  IInstruction,
  ReadonlyUint8Array,
} from "@solana/web3.js";
import {
  fetchWhitelist,
  fetchWhitelistV2,
  identifyTensorWhitelistAccount,
  Whitelist,
  TensorWhitelistAccount,
  Mode,
  WhitelistV2,
  Condition,
  fetchMaybeMintProofFromSeeds,
  fetchMaybeMintProofV2FromSeeds,
  InitUpdateMintProofAsyncInput,
  getInitUpdateMintProofInstructionAsync,
  InitUpdateMintProofV2AsyncInput,
  getInitUpdateMintProofV2InstructionAsync,
} from "@tensor-foundation/whitelist";
import { keypairBytes, rpc } from "./common";
import { simulateTxWithIxs } from "@tensor-foundation/common-helpers";

// upserts the off-chain merkle proof to the mintProof/mintProofV2 account
// if needed (if the collection is verified via a custom mint list)
// This only has to be done once per mint assuming the mint list
// of the corresponding collection does not change!
async function initMintProofIfNeeded(mint: string, whitelist: string) {
  const keypairSigner: KeyPairSigner = await createKeyPairSignerFromBytes(
    Buffer.from(keypairBytes),
    false,
  );

  // fetch whitelist account data to check whether it's a Whitelist or a WhitelistV2
  const maybeWhitelistAccount = await fetchEncodedAccount(
    rpc,
    address(whitelist),
  );
  assertAccountExists(maybeWhitelistAccount);
  const whitelistAccountType = identifyTensorWhitelistAccount(
    maybeWhitelistAccount.data,
  );

  // check if Whitelist/WhitelistV2 account has a non-zero merkle tree root hash
  // which indicates that one possible way of verifying would be to
  // have a valid merkle proof in the MintProof/MintProofV2 account
  var hasNonZeroRootHash: boolean;

  // whitelist account is of type Whitelist
  if (whitelistAccountType === TensorWhitelistAccount.Whitelist) {
    const whitelistData: Whitelist = await fetchWhitelist(
      rpc,
      address(whitelist),
    ).then((whitelistResponse) => whitelistResponse.data);
    const rootHash = whitelistData.rootHash;
    hasNonZeroRootHash = !rootHash.every((value) => value === 0);
  }

  // whitelist account is of type WhitelistV2
  else if (whitelistAccountType == TensorWhitelistAccount.WhitelistV2) {
    const whitelistV2Data: WhitelistV2 = await fetchWhitelistV2(
      rpc,
      address(whitelist),
    ).then((whitelistV2Response) => whitelistV2Response.data);
    const conditions: Condition[] = whitelistV2Data.conditions;
    // if the WhitelistAccountV2 account has a root hash, it's enforced to be the first item
    // of the conditions array => if present, check if non-zero
    const firstConditionValueBytes = getAddressEncoder().encode(
      conditions[0].value,
    );
    hasNonZeroRootHash =
      conditions[0].mode === Mode.MerkleTree &&
      !firstConditionValueBytes.every((value) => value === 0);
  } else {
    throw new Error(
      `Whitelist argument ${whitelist} is neither of type Whitelist nor of type WhitelistV2`,
    );
  }

  // if there is a non-zero rootHash as part of the whitelist account,
  // check first if mintProof is already initialized and matches
  // the proof. If not => fetch mint proof and initialize/update mint proof account
  if (hasNonZeroRootHash) {
    // fetch actual proof from endpoint (no API key needed for that particular call!)
    const URL = `https://api.mainnet.tensordev.io/api/v1/sdk/mint_proof?whitelist=${whitelist}&mint=${mint}`;
    const proofResponse = await fetch(URL);
    if (!proofResponse.ok) {
      console.log(
        `Mint ${mint} is not verified for Merkle Tree of Whitelist ${whitelist}, it might be verified via other condition fields though.`,
      );
      console.log(
        `If that's the case, there is no need for a valid mint proof!`,
      );
      return;
    }
    const proofArray: number[][] = await proofResponse.json();
    const proof: Uint8Array[] = proofArray.map(
      (proof) => new Uint8Array(proof),
    );

    var upsertMintProofInstructions: IInstruction[] = [];

    // if whitelist is of type Whitelist, check if mintProof account exists with valid proof
    // by converting each proof into an Address and checking if the fetched mintProof
    // contains every one of these proofs
    if (whitelistAccountType === TensorWhitelistAccount.Whitelist) {
      const mintProof = await fetchMaybeMintProofFromSeeds(rpc, {
        mint: address(mint),
        whitelist: address(whitelist),
      });
      if (mintProof.exists) {
        const proofAddresses: Address[] = proof.map((proofArray: Uint8Array) =>
          getAddressDecoder().decode(proofArray),
        );
        const fetchedProofAddresses: Address[] = mintProof.data.proof.map(
          (proofBytes: ReadonlyUint8Array) =>
            getAddressDecoder().decode(proofBytes),
        );
        const onchainProofValid = proofAddresses.every(
          (proofAddress: Address) =>
            fetchedProofAddresses.includes(proofAddress),
        );
        if (onchainProofValid) {
          console.log("On-chain mint proof is already up-to-date!");
          return;
        }
      }
      // if either the mintProof account doesn't exist or if it contains an
      // invalid proof, construct initialization/update instruction
      const initUpdateMintProofAsyncInput: InitUpdateMintProofAsyncInput = {
        whitelist: address(whitelist),
        mint: address(mint),
        user: keypairSigner,
        proof: proof,
      };
      const mintProofInstruction = await getInitUpdateMintProofInstructionAsync(
        initUpdateMintProofAsyncInput,
      );
      upsertMintProofInstructions.push(mintProofInstruction);
    }

    // if whitelist is of type WhitelistV2, check if mintProofV2 account exists with valid proof
    // similar to how mintProof's validity got checked above
    else if (whitelistAccountType === TensorWhitelistAccount.WhitelistV2) {
      const mintProofV2 = await fetchMaybeMintProofV2FromSeeds(rpc, {
        mint: address(mint),
        whitelist: address(whitelist),
      });
      if (mintProofV2.exists) {
        const proofAddresses: Address[] = proof.map((proofArray: Uint8Array) =>
          getAddressDecoder().decode(proofArray),
        );
        const fetchedProofAddresses: Address[] = mintProofV2.data.proof.map(
          (proofBytes: ReadonlyUint8Array) =>
            getAddressDecoder().decode(proofBytes),
        );
        const onchainProofValid = proofAddresses.every(
          (proofAddress: Address) =>
            fetchedProofAddresses.includes(proofAddress),
        );
        if (onchainProofValid) {
          console.log("On-chain mint proof is already up-to-date!");
          return;
        }
      }
      // upsert new mintProofV2 account with correct proof
      const initUpdateMintProofV2AsyncInput: InitUpdateMintProofV2AsyncInput = {
        payer: keypairSigner,
        mint: address(mint),
        whitelist: address(whitelist),
        proof: proof,
      };
      const createProofIx = await getInitUpdateMintProofV2InstructionAsync(
        initUpdateMintProofV2AsyncInput,
      );
      upsertMintProofInstructions.push(createProofIx);
    }

    // construct and simulate a transaction upserting the mintProof 
    await simulateTxWithIxs(rpc, upsertMintProofInstructions, keypairSigner);
  }
}
initMintProofIfNeeded(
  "2CNP3MVmCj5FEFja676PkvS8Rm7ZVCxdsPWkLgqHb87e",
  "ExGjYcjK1GNtQ5WnN3gy22132s6WMzrgFUHDNi6sT6nL",
);
