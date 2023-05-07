import { filesize } from 'filesize';

export function toPercent(num, denom) {
  let decimal = denom ? num / denom : num;

  return Math.round(decimal * 100);
}

export function average(nums) {
  return (
    nums.reduce((acc, curr) => {
      return acc + curr;
    }, 0) / nums.length
  );
}

export function twoDecimals(num) {
  return Math.round(num * 100) / 100;
}

export const size = (str) => filesize(str.length, { base: 2, standard: 'jedec' });
