import { v4 } from 'uuid';
import { address } from '@solana/addresses';
import { Condition, Mode } from '../src';

export const uuidToUint8Array = (uuid: string) => {
  const encoder = new TextEncoder();
  // replace any '-' to handle uuids
  return encoder.encode(uuid.replaceAll('-', ''));
};

export const padConditions = (conditions: Condition[]) => {
  if (conditions.length > 5) {
    throw new Error('Too many conditions');
  }

  while (conditions.length < 5) {
    conditions.push({
      mode: Mode.Empty,
      value: address('11111111111111111111111111111111'),
    });
  }

  return conditions;
};

export const generateUuid = () => uuidToUint8Array(v4());
