import {
  KeyPairSigner,
  createPrivateKeyFromBytes,
  createSignerFromKeyPair,
} from '@solana/web3.js';
import { Client, fundWalletWithSol } from '@tensor-foundation/test-helpers';

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

export const createKeyPairSignerFromBytes = async (
  bytes: Uint8Array
): Promise<KeyPairSigner<string>> => {
  const publicKeyBytes = bytes.slice(32);
  const privateKeyBytes = bytes.slice(0, 32);

  const [publicKey, privateKey] = await Promise.all([
    crypto.subtle.importKey('raw', publicKeyBytes, 'Ed25519', true, ['verify']),
    createPrivateKeyFromBytes(privateKeyBytes),
  ]);
  return await createSignerFromKeyPair({ privateKey, publicKey });
};

export const setupSigners = async (client: Client) => {
  const cosigner = await createKeyPairSignerFromBytes(new Uint8Array(COSIGNER));
  await fundWalletWithSol(client, cosigner.address, 10_000_000_000n);

  const owner = await createKeyPairSignerFromBytes(new Uint8Array(OWNER));
  await fundWalletWithSol(client, owner.address, 10_000_000_000n);

  return { cosigner, owner };
};
