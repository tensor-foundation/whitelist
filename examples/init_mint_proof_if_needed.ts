const { createTransaction, setTransactionFeePayer, appendTransactionInstruction, getBase64EncodedWireTransaction, setTransactionLifetimeUsingBlockhash } = require('@solana/transactions');
const { address, getAddressEncoder } = require("@solana/addresses");
const { createSolanaRpc } = require("@solana/rpc");
const { createKeyPairSignerFromBytes } = require('@solana/signers');
const { isNone } = require("@solana/options");
const { fetchWhitelist, getWhitelistFromCollId, getInitUpdateMintProofInstructionAsync } = require('@tensor-foundation/whitelist');
const { pipe } = require("@solana/functional");

async function initMintProofIfNeeded(mint: string, collId: string) {

    // First 32 bytes == private key
    // Last 32 bytes == public key
    // If you want to actually sign + send tx, you need to prepend your private key bytes instead of 32 zero-bytes.
    // For simulations, having only the publickey part is sufficient! You can leave the first 32 bytes as zero-bytes since nothing needs to get signed.
    const keypairBytes = new Uint8Array([...new Uint8Array(32).map(() => 0), ...getAddressEncoder().encode(address("2VQA3FT8tWRPgiwVPh2oKm1JTA44ocGspKn8yRZRvXiS"))]);
    const keypairSigner = await createKeyPairSignerFromBytes(Buffer.from(keypairBytes), false);

    const whitelist = await getWhitelistFromCollId(collId);

    // fetch whitelist account data
    const rpc = createSolanaRpc("https://api.mainnet-beta.solana.com/");
    const whitelistAccountData = await fetchWhitelist(rpc, whitelist);
    // voc == Verified On-chain Collection
    const voc = whitelistAccountData.data.voc;
    // fvc == First Verified Creator
    const fvc = whitelistAccountData.data.fvc;

    // if voc and fvc are both null, fetch mint proof and simulate/send tx
    // else no mintProof is needed (!)
    if (isNone(voc) && isNone(fvc)) {

        // fetch actual proof from endpoint (no API key needed for that particular call!)
        const URL = `https://api.mainnet.tensordev.io/api/v1/sdk/mint_proof?whitelist=${whitelist}&mint=${mint}`;
        const proof = await fetch(URL).then((r: any) => r.json());
        const initUpdateMintProofAsyncInput = {
            whitelist: whitelist,
            mint: address(mint),
            user: keypairSigner,
            proof: proof,
        };
        const mintProofInstruction = await getInitUpdateMintProofInstructionAsync(initUpdateMintProofAsyncInput);

        // TODO: will get outsourced to toolkit
        const { value: latestBlockhash } = await rpc.getLatestBlockhash().send();
        const simPipe = pipe(
            createTransaction({ version: 0 }),
            (tx: any) => appendTransactionInstruction(mintProofInstruction, tx),
            (tx: any) => setTransactionFeePayer(keypairSigner.address, tx),
            (tx: any) => setTransactionLifetimeUsingBlockhash(latestBlockhash, tx),
            (tx: any) => getBase64EncodedWireTransaction(tx)
        );
        const simulationResponse = await rpc.simulateTransaction(simPipe, { encoding: 'base64', sigVerify: false, replaceRecentBlockhash: true }).send();
        console.log(simulationResponse);
    }
}
initMintProofIfNeeded("AWdYtzjDCSjEohVFjmU7djbPdcnKd55NmU6kp1tZHFb5", "5866e4e4-3dca-4649-ad3f-710bbd15af66");