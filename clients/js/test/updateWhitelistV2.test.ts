import {
  appendTransactionMessageInstruction,
  generateKeyPairSigner,
  none,
  pipe,
} from '@solana/web3.js';
import {
  createDefaultSolanaClient,
  createDefaultTransaction,
  generateKeyPairSignerWithSol,
  signAndSendTransaction,
} from '@tensor-foundation/test-helpers';
import test from 'ava';
import {
  Condition,
  Mode,
  TENSOR_WHITELIST_ERROR__INVALID_AUTHORITY,
  TENSOR_WHITELIST_ERROR__TOO_MANY_MERKLE_PROOFS,
  fetchWhitelistV2,
  getUpdateWhitelistV2Instruction,
  operation,
} from '../src';
import {
  createWhitelist,
  getAccountDataLength,
  updateWhitelist,
} from './_common';

test('it can update a whitelist v2, reallocing to be larger', async (t) => {
  const client = createDefaultSolanaClient();
  const payer = await generateKeyPairSignerWithSol(client);
  const updateAuthority = await generateKeyPairSignerWithSol(client);
  const voc = (await generateKeyPairSigner()).address;

  // Default conditions size is one item in createWhitelist helper fn.
  const { whitelist, uuid, conditions } = await createWhitelist({
    payer,
    client,
    updateAuthority,
  });

  t.like(await fetchWhitelistV2(client.rpc, whitelist), {
    address: whitelist,
    data: {
      updateAuthority: updateAuthority.address,
      uuid,
      conditions,
    },
  });

  const originalAccountSize = await getAccountDataLength(client, whitelist);

  // Make a larger conditions list
  const newConditions = [
    { mode: Mode.VOC, value: voc },
    { mode: Mode.FVC, value: updateAuthority.address },
    { mode: Mode.FVC, value: updateAuthority.address },
    { mode: Mode.FVC, value: updateAuthority.address },
    { mode: Mode.FVC, value: updateAuthority.address },
    { mode: Mode.FVC, value: updateAuthority.address },
  ];

  const updateWhitelistIx = getUpdateWhitelistV2Instruction({
    payer,
    updateAuthority,
    whitelist,
    conditions: newConditions,
    freezeAuthority: operation('Noop'),
  });

  const beginningPayerBalance = (
    await client.rpc.getBalance(payer.address).send()
  ).value;

  await pipe(
    await createDefaultTransaction(client, payer),
    (tx) => appendTransactionMessageInstruction(updateWhitelistIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  t.like(await fetchWhitelistV2(client.rpc, whitelist), {
    address: whitelist,
    data: {
      updateAuthority: updateAuthority.address,
      uuid,
      conditions: newConditions,
    },
  });

  // Check that the account size has increased
  const newAccountSize = await getAccountDataLength(client, whitelist);
  t.true(newAccountSize > originalAccountSize);

  // Check that payer balance has decreased
  const endingPayerBalance = (await client.rpc.getBalance(payer.address).send())
    .value;
  t.true(endingPayerBalance < beginningPayerBalance);
});

test('it can update a whitelist v2 reallocing to be smaller', async (t) => {
  const client = createDefaultSolanaClient();
  const payer = await generateKeyPairSignerWithSol(client);
  const updateAuthority = await generateKeyPairSignerWithSol(client);
  const voc = (await generateKeyPairSigner()).address;

  // Start with larger conditions size
  const conditions = [
    { mode: Mode.VOC, value: voc },
    { mode: Mode.FVC, value: updateAuthority.address },
    { mode: Mode.FVC, value: updateAuthority.address },
    { mode: Mode.FVC, value: updateAuthority.address },
    { mode: Mode.FVC, value: updateAuthority.address },
  ];

  const { whitelist, uuid } = await createWhitelist({
    client,
    payer,
    updateAuthority,
    conditions,
  });

  const originalAccountSize = await getAccountDataLength(client, whitelist);

  t.like(await fetchWhitelistV2(client.rpc, whitelist), {
    address: whitelist,
    data: {
      updateAuthority: updateAuthority.address,
      uuid,
      conditions,
    },
  });

  // Smaller conditions list
  const newConditions: Condition[] = [{ mode: Mode.VOC, value: voc }];

  const updateWhitelistIx = getUpdateWhitelistV2Instruction({
    payer,
    updateAuthority,
    whitelist,
    conditions: newConditions,
    freezeAuthority: operation('Noop'),
  });

  const beginningPayerBalance = (
    await client.rpc.getBalance(payer.address).send()
  ).value;

  await pipe(
    await createDefaultTransaction(client, updateAuthority),
    (tx) => appendTransactionMessageInstruction(updateWhitelistIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  t.like(await fetchWhitelistV2(client.rpc, whitelist), {
    address: whitelist,
    data: {
      updateAuthority: updateAuthority.address,
      uuid,
      conditions: newConditions,
    },
  });

  // Check that the account size has dedcreased
  const newAccountSize = await getAccountDataLength(client, whitelist);
  t.true(newAccountSize < originalAccountSize);

  // Check that payer balance has increased
  const endingPayerBalance = (await client.rpc.getBalance(payer.address).send())
    .value;
  t.true(endingPayerBalance > beginningPayerBalance);
});

test('it cannot edit a whitelist v2 with the wrong authority', async (t) => {
  const client = createDefaultSolanaClient();
  const updateAuthority = await generateKeyPairSignerWithSol(client);
  const wrongAuthority = await generateKeyPairSignerWithSol(client);
  const voc = (await generateKeyPairSigner()).address;

  const { whitelist, uuid, conditions } = await createWhitelist({
    client,
    updateAuthority,
  });

  t.like(await fetchWhitelistV2(client.rpc, whitelist), {
    address: whitelist,
    data: {
      updateAuthority: updateAuthority.address,
      uuid,
      conditions,
    },
  });

  const newConditions = [
    { mode: Mode.VOC, value: voc },
    { mode: Mode.FVC, value: updateAuthority.address },
  ];

  const updateWhitelistIx = getUpdateWhitelistV2Instruction({
    payer: updateAuthority,
    updateAuthority: wrongAuthority,
    whitelist,
    conditions: newConditions,
    freezeAuthority: operation('Noop'),
  });

  try {
    await pipe(
      await createDefaultTransaction(client, wrongAuthority),
      (tx) => appendTransactionMessageInstruction(updateWhitelistIx, tx),
      (tx) => signAndSendTransaction(client, tx)
    );
    t.fail('Should have thrown an error.');
  } catch (error) {
    t.like(error, {
      cause: {
        context: {
          code: TENSOR_WHITELIST_ERROR__INVALID_AUTHORITY,
        },
      },
    });
  }
});

test('it can change the update authority of a whitelist v2', async (t) => {
  const client = createDefaultSolanaClient();
  const updateAuthority = await generateKeyPairSignerWithSol(client);
  const newUpdateAuthority = await generateKeyPairSignerWithSol(client);

  const { whitelist, uuid, conditions } = await createWhitelist({
    client,
    updateAuthority,
  });

  t.like(await fetchWhitelistV2(client.rpc, whitelist), {
    address: whitelist,
    data: {
      updateAuthority: updateAuthority.address,
      uuid,
      conditions,
    },
  });

  const updateWhitelistIx = getUpdateWhitelistV2Instruction({
    payer: updateAuthority,
    updateAuthority,
    whitelist,
    newUpdateAuthority,
    conditions: none(),
    freezeAuthority: operation('Noop'),
  });

  await pipe(
    await createDefaultTransaction(client, updateAuthority),
    (tx) => appendTransactionMessageInstruction(updateWhitelistIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  t.like(await fetchWhitelistV2(client.rpc, whitelist), {
    address: whitelist,
    data: {
      updateAuthority: newUpdateAuthority.address,
      uuid,
      conditions,
    },
  });
});

test('it cannot update a whitelist v2 with more than one merkle proof', async (t) => {
  const client = createDefaultSolanaClient();
  const updateAuthority = await generateKeyPairSignerWithSol(client);
  const merkleProof1 = (await generateKeyPairSigner()).address;
  const merkleProof2 = (await generateKeyPairSigner()).address;

  const conditions = [
    { mode: Mode.MerkleTree, value: merkleProof1 },
    { mode: Mode.FVC, value: updateAuthority.address },
  ];

  const { whitelist, uuid } = await createWhitelist({
    client,
    updateAuthority,
    conditions,
  });

  t.like(await fetchWhitelistV2(client.rpc, whitelist), {
    address: whitelist,
    data: {
      updateAuthority: updateAuthority.address,
      uuid,
      conditions,
    },
  });

  const newConditions = [
    { mode: Mode.FVC, value: updateAuthority.address },
    { mode: Mode.MerkleTree, value: merkleProof1 },
    { mode: Mode.MerkleTree, value: merkleProof2 },
  ];

  const updateWhitelistIx = getUpdateWhitelistV2Instruction({
    payer: updateAuthority,
    updateAuthority,
    whitelist,
    conditions: newConditions,
    freezeAuthority: operation('Noop'),
  });

  try {
    await pipe(
      await createDefaultTransaction(client, updateAuthority),
      (tx) => appendTransactionMessageInstruction(updateWhitelistIx, tx),
      (tx) => signAndSendTransaction(client, tx)
    );
    t.fail('Too many merkle proofs');
  } catch (error) {
    t.like(error, {
      cause: {
        context: {
          code: TENSOR_WHITELIST_ERROR__TOO_MANY_MERKLE_PROOFS,
        },
      },
    });
  }
});

test('it moves the merkle proof to the first index for a whitelist v2', async (t) => {
  const client = createDefaultSolanaClient();
  const updateAuthority = await generateKeyPairSignerWithSol(client);
  const merkleProof1 = (await generateKeyPairSigner()).address;

  // Create initial whitelist.
  const conditions = [
    { mode: Mode.MerkleTree, value: merkleProof1 },
    { mode: Mode.FVC, value: updateAuthority.address },
  ];

  const { whitelist } = await createWhitelist({
    client,
    updateAuthority,
    conditions,
  });

  // Merkle is last item in the list.
  let newConditions = [
    { mode: Mode.FVC, value: updateAuthority.address },
    { mode: Mode.MerkleTree, value: merkleProof1 },
  ];

  let expectedConditions = [
    { mode: Mode.MerkleTree, value: merkleProof1 },
    { mode: Mode.FVC, value: updateAuthority.address },
  ];

  await updateWhitelist({
    client,
    whitelist,
    updateAuthority,
    newConditions,
  });

  t.like(await fetchWhitelistV2(client.rpc, whitelist), {
    address: whitelist,
    data: {
      updateAuthority: updateAuthority.address,
      conditions: expectedConditions,
    },
  });

  // Merkle is in the middle of the list.
  newConditions = [
    { mode: Mode.VOC, value: updateAuthority.address },
    { mode: Mode.VOC, value: updateAuthority.address },
    { mode: Mode.MerkleTree, value: merkleProof1 },
    { mode: Mode.FVC, value: updateAuthority.address },
    { mode: Mode.FVC, value: updateAuthority.address },
  ];

  // Rotated to the front.
  expectedConditions = [
    { mode: Mode.MerkleTree, value: merkleProof1 },
    { mode: Mode.FVC, value: updateAuthority.address },
    { mode: Mode.FVC, value: updateAuthority.address },
    { mode: Mode.VOC, value: updateAuthority.address },
    { mode: Mode.VOC, value: updateAuthority.address },
  ];

  await updateWhitelist({
    client,
    whitelist,
    updateAuthority,
    newConditions,
  });

  t.like(await fetchWhitelistV2(client.rpc, whitelist), {
    address: whitelist,
    data: {
      updateAuthority: updateAuthority.address,
      conditions: expectedConditions,
    },
  });

  // Merkle is first item in the list.
  newConditions = [
    { mode: Mode.MerkleTree, value: merkleProof1 },
    { mode: Mode.VOC, value: updateAuthority.address },
    { mode: Mode.VOC, value: updateAuthority.address },
    { mode: Mode.FVC, value: updateAuthority.address },
    { mode: Mode.FVC, value: updateAuthority.address },
  ];

  await updateWhitelist({
    client,
    whitelist,
    updateAuthority,
    newConditions,
  });

  t.like(await fetchWhitelistV2(client.rpc, whitelist), {
    address: whitelist,
    data: {
      updateAuthority: updateAuthority.address,
      // No rotation needed, should be the same.
      conditions: newConditions,
    },
  });
});

test('noop leaves conditions unchanged', async (t) => {
  const client = createDefaultSolanaClient();
  const updateAuthority = await generateKeyPairSignerWithSol(client);

  const conditions = [{ mode: Mode.FVC, value: updateAuthority.address }];

  const { whitelist, uuid } = await createWhitelist({
    client,
    updateAuthority,
    conditions,
  });

  t.like(await fetchWhitelistV2(client.rpc, whitelist), {
    address: whitelist,
    data: {
      updateAuthority: updateAuthority.address,
      uuid,
      conditions,
    },
  });

  const updateWhitelistIx = getUpdateWhitelistV2Instruction({
    payer: updateAuthority,
    updateAuthority,
    whitelist,
    conditions: null,
    freezeAuthority: operation('Noop'),
  });

  await pipe(
    await createDefaultTransaction(client, updateAuthority),
    (tx) => appendTransactionMessageInstruction(updateWhitelistIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  t.like(await fetchWhitelistV2(client.rpc, whitelist), {
    address: whitelist,
    data: {
      updateAuthority: updateAuthority.address,
      // No change.
      conditions,
    },
  });
});
