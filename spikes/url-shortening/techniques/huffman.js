import base64 from '@algorithm.ts/base64';
import * as huffman from '@algorithm.ts/huffman';

export function encode(text) {
  return compress(text);
}

export function decode(text) {
  return decompress(text);
}

/**
 * The Huffman library requires a lot of boilerplate.
 */
function compress(text) {
  const { encodedData, encodingTable } = huffman.encode(text);
  const cipherBuffer = huffman.compress(encodedData);
  const cipherText = base64.encode(cipherBuffer);

  const textEncoder = new TextEncoder('utf-8');
  const encodingTableText = base64.encode(
    textEncoder.encode(JSON.stringify(compressEncodingTable(encodingTable)))
  );
  const result = (encodingTableText + '-' + cipherText)
    .replace(/\//g, '(')
    .replace(/\+/g, ')')
    .replace(/=/g, '_');

  return result;
}

function compressEncodingTable(table) {
  const entries = Object.entries(table)
    .map(([value, path]) => {
      let p = 1;

      for (const x of path) p = (p << 1) | x;

      return [value, p];
    })
    .flat();

  return entries;
}

function decompress(text) {
  const [encodingTableText, cipherText] = text
    .replace(/\(/g, '/')
    .replace(/\)/g, '+')
    .replace(/_/g, '=')
    .split('-');
  const textDecoder = new TextDecoder('utf-8');
  const encodingTable = decompressEncodingTable(
    JSON.parse(textDecoder.decode(base64.decode(encodingTableText)))
  );
  const tree = huffman.fromEncodingTable(encodingTable);

  const cipherData = huffman.decompress(base64.decode(cipherText));
  const plaintext = huffman.decode(cipherData, tree);

  return plaintext;
}

function decompressEncodingTable(entries) {
  const table = {};

  for (let i = 0; i < entries.length; i += 2) {
    const value = entries[i];
    const p = entries[i + 1];
    const path = [];

    for (let x = p; x > 1; x >>= 1) path.push(x & 1);
    table[value] = path.reverse();
  }

  return table;
}
