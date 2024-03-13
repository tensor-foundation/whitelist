/* eslint-disable import/no-extraneous-dependencies */
import '@solana/webcrypto-ed25519-polyfill';

import {
  generateKeyPairSigner,
  signTransactionWithSigners,
  KeyPairSigner,
  createSignerFromKeyPair,
} from '@solana/signers';
import {
  Address,
  Commitment,
  CompilableTransaction,
  createDefaultAirdropRequester,
  createDefaultRpcSubscriptionsTransport,
  createDefaultRpcTransport,
  createDefaultTransactionSender,
  createPrivateKeyFromBytes,
  createSolanaRpc,
  createSolanaRpcSubscriptions,
  createTransaction,
  getSignatureFromTransaction,
  ITransactionWithBlockhashLifetime,
  lamports,
  pipe,
  setTransactionFeePayer,
  setTransactionLifetimeUsingBlockhash,
} from '@solana/web3.js';

export const COSIGNER = [
  139, 185, 120, 181, 235, 102, 176, 141, 98, 254, 81, 113, 52, 206, 57, 93,
  238, 178, 82, 146, 67, 49, 113, 72, 30, 14, 36, 185, 191, 184, 158, 163, 254,
  93, 20, 56, 163, 101, 56, 248, 211, 197, 95, 142, 65, 33, 2, 86, 19, 166, 253,
  71, 55, 184, 198, 152, 79, 84, 213, 84, 86, 30, 52, 89,
];

export const OWNER = [
  130, 107, 254, 149, 27, 133, 51, 79, 52, 57, 108, 247, 146, 80, 231, 133, 207,
  79, 204, 188, 43, 208, 32, 6, 120, 122, 220, 160, 124, 150, 9, 169, 16, 177,
  105, 4, 193, 81, 250, 68, 85, 237, 201, 51, 83, 132, 239, 144, 199, 246, 3,
  244, 247, 186, 156, 108, 203, 60, 119, 143, 8, 131, 121, 22,
];

type Client = {
  rpc: ReturnType<typeof createSolanaRpc>;
  rpcSubscriptions: ReturnType<typeof createSolanaRpcSubscriptions>;
};

export const createDefaultSolanaClient = (): Client => {
  const rpc = createSolanaRpc({
    transport: createDefaultRpcTransport({ url: 'http://127.0.0.1:8899' }),
  });
  const rpcSubscriptions = createSolanaRpcSubscriptions({
    transport: createDefaultRpcSubscriptionsTransport({
      url: 'ws://127.0.0.1:8900',
    }),
  });

  return { rpc, rpcSubscriptions };
};

export const createKeyPairSigner = async (
  client: Client,
  bytes: Uint8Array
): Promise<KeyPairSigner<string>> => {
  const publicKeyBytes = bytes.slice(32);
  const privateKeyBytes = bytes.slice(0, 32);

  const [publicKey, privateKey] = await Promise.all([
    crypto.subtle.importKey('raw', publicKeyBytes, 'Ed25519', true, ['verify']),
    createPrivateKeyFromBytes(privateKeyBytes),
  ]);
  return createSignerFromKeyPair({ privateKey, publicKey });
};

export const generateKeyPairSignerWithSol = async (
  client: Client,
  putativeLamports: bigint = 1_000_000_000n
) => {
  const airdropRequester = createDefaultAirdropRequester(client);
  const signer = await generateKeyPairSigner();
  await airdropRequester({
    recipientAddress: signer.address,
    lamports: lamports(putativeLamports),
    commitment: 'confirmed',
  });
  return signer;
};

export const fundWalletWithSol = async (
  client: Client,
  address: Address,
  putativeLamports: bigint = 1_000_000_000n
) => {
  const airdropRequester = createDefaultAirdropRequester(client);
  await airdropRequester({
    recipientAddress: address,
    lamports: lamports(putativeLamports),
    commitment: 'confirmed',
  });
};

export const createDefaultTransaction = async (
  client: Client,
  feePayer: Address
) => {
  const { value: latestBlockhash } = await client.rpc
    .getLatestBlockhash()
    .send();
  return pipe(
    createTransaction({ version: 0 }),
    (tx) => setTransactionFeePayer(feePayer, tx),
    (tx) => setTransactionLifetimeUsingBlockhash(latestBlockhash, tx)
  );
};

export const signAndSendTransaction = async (
  client: Client,
  transaction: CompilableTransaction & ITransactionWithBlockhashLifetime,
  commitment: Commitment = 'confirmed'
) => {
  const signedTransaction = await signTransactionWithSigners(transaction);
  const signature = getSignatureFromTransaction(signedTransaction);
  await createDefaultTransactionSender(client)(signedTransaction, {
    commitment,
  });
  return signature;
};

export const getBalance = async (client: Client, address: Address) =>
  (await client.rpc.getBalance(address, { commitment: 'confirmed' }).send())
    .value;

export const setupSigners = async (client: Client) => {
  const cosigner = await createKeyPairSigner(client, new Uint8Array(COSIGNER));
  await fundWalletWithSol(client, cosigner.address, 10_000_000_000n);

  const owner = await createKeyPairSigner(client, new Uint8Array(OWNER));
  await fundWalletWithSol(client, owner.address, 10_000_000_000n);

  return { cosigner, owner };
};
