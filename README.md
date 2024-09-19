<h1 align="center">
  Tensor Whitelist
</h1>
<p align="center">
  <img width="400" alt="Tensor Whitelist" src="https://github.com/tensor-foundation/whitelist/assets/729235/d159b3cd-19f8-4aca-8915-5a63e3a6d62f" />
</p>
<p align="center">
  Verify your collection on-chain.
</p>

## Program

This project contains the following program:

- [Whitelist](./program/README.md) `TL1ST2iRBzuGTqLn1KXnGdSnEow62BzPnGiqyRXhWtW`

You will need a Rust version compatible with BPF to compile the program, currently we recommend using Rust 1.75.0.

## Clients

This project contains the following clients:

- [JavaScript](./clients/js/README.md)
- [Rust](./clients/rust/README.md)

## Status

This new Whitelist program is currently deployed to devnet, and will be deployed to mainnet on October 2nd.

| Devnet | Mainnet |
| ------ | ------- |
| v0.1.1 | -       |

## Getting started

Install this library using the package manager of your choice.

```sh shell
npm install @tensor-foundation/whitelist
```

## Examples

### Find Whitelist Account PDA

```typescript
const uuid = Buffer.from(
  "099c4f20-fd22-44b3-af6d-43d2b9f4cf21".replaceAll("-", ""),
).toJSON().data;
const whitelistSeeds: WhitelistSeeds = {
  uuid: uuid,
};
const [whitelistPDA] = await findWhitelistPda(whitelistSeeds);
```

### Fetch Whitelist Account

```typescript
const transport = createDefaultRpcTransport({
  url: "https://api.mainnet-beta.solana.com/",
});
const rpc = createSolanaRpc({ transport });
const whitelistAccountResponse = await fetchWhitelist(rpc, whitelistPDA);
```

### Retrieve InitUpdateMintProof Instruction

```typescript
const mint =
  "DWBXzV8MjkCRLxWwZEZm6B3wfrpgh4oYcYKVxSuL9ay6" as Address<"MintType">;
const whitelist =
  "ExGjYcjK1GNtQ5WnN3gy22132s6WMzrgFUHDNi6sT6nL" as Address<"WhitelistType">;
const seeds = { mint: mint, whiltelist: whitelist };
const mintProofPDA = await findMintProofPda(seeds);
const URL = `https://api.mainnet.tensordev.io/api/v1/sdk/mint_proofs?whitelist=${whitelist}&mints=${mint}`;
const response = await axios.get(URL, {
  headers: {
    "x-tensor-api-key": API_KEY,
  },
});
const proof: Array<Uint8Array> = response.data[0].proof.map(
  (proof) => proof.data,
);

const initUpdateMintProofInput = {
  whitelist: whitelist,
  mint: mint,
  mintProof: mintProofPDA,
  user: wallet.publicKey,
  proof: proof,
};
const mintProofInstruction = getInitUpdateMintProofInstruction(
  initUpdateMintProofInput,
);
```

## Community and Support

- **We're here to help!**

- Join our developer community on [discord](https://discord.com/invite/6S3pRkfedB)

## Contributing

Check out the [Contributing Guide](./CONTRIBUTING.md) the learn more about how to contribute to this project.

## License

Copyright (c) 2024 Tensor Protocol Foundation

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
