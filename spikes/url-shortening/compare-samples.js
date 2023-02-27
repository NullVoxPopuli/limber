import { filesize } from "filesize";

import { getSamples } from './data.js';
import { encode, bundleImpact } from './techniques.js'

const size = (str) => filesize(str.length, { base: 2, standard: "jedec"})


let samples = await getSamples();

function toPercent(num, denom) {
  let decimal = denom ?  num / denom : num; 

  return Math.round(decimal * 100);
}

function average(nums) {
  return nums.reduce((acc, curr) => {
    return acc + curr;
  }, 0) / nums.length;
}

function twoDecimals(num) {
  return Math.round(num * 100) / 100;
}


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

console.log(bundleImpact);
console.table(result);

console.log('Average Savings');
let averageSavings = [];
for (let [name, nums] of Object.entries(savings)) {
  averageSavings.push({
    name, 
    'Average % Savings': twoDecimals(average(nums)),
    bundleImpact: bundleImpact[name],
  });
}

console.table(averageSavings)

