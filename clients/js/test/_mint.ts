import {
  createNft,
  mplTokenMetadata,
} from '@metaplex-foundation/mpl-token-metadata';
import { generateSigner, percentAmount } from '@metaplex-foundation/umi';
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { Address, address } from '@solana/addresses';

// Create a new NFT on the local validator and return the mint address.
export const mintNft = async (): Promise<Address> => {
  const umi = createUmi('http://127.0.0.1:8899').use(mplTokenMetadata());

  const mint = generateSigner(umi);

  createNft(umi, {
    mint,
    name: 'TestNft',
    uri: 'https://arweave.net/123',
    symbol: 'TNFT',
    sellerFeeBasisPoints: percentAmount(5),
  }).sendAndConfirm(umi);

  // Return web3js 2.0 address type for compatibility with the rest of the codebase.
  return address(mint.publicKey);
};
