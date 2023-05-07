/* eslint-disable no-console */
import { Bench } from 'tinybench';

import { getSamples } from './data.js'
import { huffman, JSONCrush, LZString,names } from './techniques.js'

const samples = await getSamples();

// const iterations = 500;
const maxRuns = 4;

let runs = 0;

const printBench = (bench) => console.table(
  bench.tasks.map(({ name, result }) => ({
    "Task Name": name,
    "Iterations": result?.samples?.length,
    "Average Time (ps)": result?.mean * 1000,
    "Variance (ps)": result?.variance * 1000
  }))
);

for (let [name, originalText] of Object.entries(samples)) {
  if (runs >= maxRuns) break;

  console.log(`-------------------- ${name} --------------------`);
  runs++;

  const encodeBench = new Bench();
  const decodeBench = new Bench();

  encodeBench
    .add(names.JSONCrush, () => JSONCrush.encode(originalText))
    .add(names.huffman, () => huffman.encode(originalText))
    .add(names.lzString, () => LZString.encode(originalText));

  const encodedText = {
    [names.JSONCrush]: JSONCrush.encode(originalText),
    [names.huffman]: huffman.encode(originalText),
    [names.lzString]: LZString.encode(originalText),
  }

  decodeBench
    .add(names.JSONCrush, () => JSONCrush.decode(encodedText.JSONCrush))
    .add(names.huffman, () => huffman.decode(encodedText.huffman))
    .add(names.lzString, () => LZString.decode(encodedText.LZString));

  let start = new Date();

  await encodeBench.run();
  await decodeBench.run();

  let finish = new Date();

  console.log('Encode benchmark:')
  printBench(encodeBench);
  console.log('Decode benchmark:')
  printBench(decodeBench);
  console.log('Took: ', finish - start, ' ms');
}

