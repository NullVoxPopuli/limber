import { filesize } from "filesize";
import { Bench } from 'tinybench';

import { originalText } from './data.js'
import { names, huffman, JSONCrush, LZString } from './techniques.js'

const size = (str) => filesize(str.length, { base: 2, standard: "jedec"})


// Impact to bundle via https://bundlejs.com/
const bundleImpact = {
  [names.lzString]: '5.17KB -> 1.61KB gzip',
  [names.huffman]: '9.01KB -> 3.28KB gzip',
  [names.JSONCrush]: '0B -> 20B gzip ???'
}

console.log(
  [
    [names.original, originalText],
    [names.JSONCrush, JSONCrush.encode(originalText)],
    [names.huffman, huffman.encode(originalText)],
    [names.lzString, LZString.encode(originalText)]

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
  .add(names.JSONCrush, () => JSONCrush.encode(originalText))
  .add(names.huffman, () => huffman.encode(originalText))
  .add(names.lzString, () => LZString.encode(originalText));

const encodedText = {
  [names.JSONCrush]: JSONCrush.encode(originalText),
  [names.huffman]: huffman.encode(originalText),
  [names.lzString]: LZString.encode(originalText),
}

encodeURIComponentBench
  .add(names.JSONCrush, () => encodeURIComponent(encodedText.JSONCrush))
  .add(names.huffman, () => encodeURIComponent(encodedText.huffman))
  .add(names.lzString, () => encodeURIComponent(encodedText.LZString));

decodeBench
  .add(names.JSONCrush, () => JSONCrush.decode(encodedText.JSONCrush))
  .add(names.huffman, () => huffman.decode(encodedText.huffman))
  .add(names.lzString, () => LZString.decode(encodedText.LZString));

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
