import * as huffman from './techniques/huffman.js';
import * as JSONCrush from './techniques/json-crush.js';
import * as LZString from './techniques/lz-string.js';

export * as huffman from './techniques/huffman.js';
export * as JSONCrush from './techniques/json-crush.js';
export * as LZString from './techniques/lz-string.js';

export const names = {
  original: 'original',
  lzString: 'lz-string',
  JSONCrush: 'JSONCrush',
  huffman: 'Huffman',
};

export const encode = {
  [names.lzString]: LZString.encode,
  [names.JSONCrush]: JSONCrush.encode,
  [names.huffman]: huffman.encode,
};

// Impact to bundle via https://bundlejs.com/
export const bundleImpact = {
  [names.lzString]: '5.17KB -> 1.61KB gzip',
  [names.huffman]: '9.01KB -> 3.28KB gzip',
  [names.JSONCrush]: '7.84KB -> 2.3KB gzip -> 902B (min + gzip)',
};
