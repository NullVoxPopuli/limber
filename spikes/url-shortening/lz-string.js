import { getSamples } from './data.js';

import LZString from 'lz-string';
import { size, toPercent, average, twoDecimals } from './utils.js'

const encode = {
  base64: LZString.compressToBase64,
  UTF16: LZString.compressToUTF16,
  encodeURIComponent: LZString.compressToEncodedURIComponent,
  Uint8Array: LZString.compressToUint8Array,
} 

let samples = await getSamples();

let result = [];
let savings = {};
for (let [name, text] of Object.entries(samples)) {
  let originalURISize = (encodeURIComponent(text)).length;
  let current = {
    name,
    // original: size(text),
    ['original as URI']: size(encodeURIComponent(text)), 
  }

  for (let [technique, fn] of Object.entries(encode)) {
    let encoded = fn(text);
    let encodedURISize = encodeURIComponent(encoded).length; 
    let percentSavings = 100 - toPercent(encodedURISize, originalURISize);
    // current[technique] = size(encoded);
    current[`${technique} as URI`] = size(encodeURIComponent(encoded)); 
    current[`${technique} % savings`] = `${percentSavings}%` 

    savings[technique] ||= [];
    savings[technique].push(percentSavings);
  }

  result.push(current);
}

console.table(result);

console.log('Average Savings');
let averageSavings = [];
for (let [name, nums] of Object.entries(savings)) {
  averageSavings.push({
    name, 
    'Average % Savings': twoDecimals(average(nums))
  });
}

console.table(averageSavings)

