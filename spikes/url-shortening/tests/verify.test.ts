import { describe, expect, test } from 'vitest';

import { originalText } from '../data.js';

describe('Huffman', () => {
  test('encode and decode are inverses', async () => {
    let { encode, decode } = await import('../techniques/huffman.js');

    expect(decode(encode(originalText))).toEqual(originalText);
  });
});

describe('JSONCrush', () => {
  test('encode and decode are inverses', async () => {
    let { encode, decode } = await import('../techniques/json-crush.js');

    expect(decode(encode(originalText))).toEqual(originalText);
  });
});

describe('lz-string', () => {
  test('encode and decode are inverses', async () => {
    let { encode, decode } = await import('../techniques/lz-string.js');

    expect(decode(encode(originalText))).toEqual(originalText);
  });
});
