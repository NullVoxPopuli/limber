import { filesize } from "filesize";
import { Bench } from 'tinybench';

import { originalText } from './data.js'
import * as huffman from './techniques/huffman.js';
import * as JSONCrush from './techniques/json-crush.js';
import * as LZString from './techniques/lz-string.js';

const size = (str) => filesize(str.length, { base: 2, standard: "jedec"})

const names = {
  original: 'original',
  lzString: 'lz-string',
  JSONCrush: 'JSONCrush',
  huffman: 'Huffman',
}

// Impact to bundle via https://bundlejs.com/
const bundleImpact = {
  [names.lzString]: '5.17KB (1.61KB gzip)'
}

console.log(
  [
    ['original', originalText],
    ['JSONCrush', JSONCrush.encode(originalText)],
    ['Huffman', huffman.encode(originalText)],
    ['lz-string', LZString.encode(originalText)]

  ].map(([label, text]) => {
    return `\n
      ${label}: ${size(text)}
      ${label} as URI: ${size(encodeURIComponent(text))}`
  }).join('')
);

const iterations = 1000;
const encodeBench = new Bench({ iterations });
const decodeBench = new Bench({ iterations });
const encodeURIComponentBench = new Bench({ iterations });

encodeBench
  .add('JSONCrush', () => JSONCrush.encode(originalText))
  .add('Huffman', () => huffman.encode(originalText))
  .add('lz-string', () => LZString.encode(originalText));

const encodedText = {
  JSONCrush: JSONCrush.encode(originalText),
  huffman: huffman.encode(originalText),
  LZString: LZString.encode(originalText),
}

encodeURIComponentBench
  .add('JSONCrush', () => encodeURIComponent(encodedText.JSONCrush))
  .add('Huffman', () => encodeURIComponent(encodedText.huffman))
  .add('lz-string', () => encodeURIComponent(encodedText.LZString));

decodeBench
  .add('JSONCrush', () => JSONCrush.decode(encodedText.JSONCrush))
  .add('Huffman', () => huffman.decode(encodedText.huffman))
  .add('lz-string', () => LZString.decode(encodedText.LZString));

const printBench = (bench) => console.table(
  bench.tasks.map(({ name, result }) => ({
    "Task Name": name,
    "Average Time (ps)": result?.mean * 1000,
    "Variance (ps)": result?.variance * 1000
  }))
);

await encodeBench.run();
await decodeBench.run();
await encodeURIComponentBench.run();

console.log('Encode benchmark:')
printBench(encodeBench);
console.log('Decode benchmark:')
printBench(decodeBench);
console.log('encodeURIComponent:')
printBench(encodeURIComponentBench);
