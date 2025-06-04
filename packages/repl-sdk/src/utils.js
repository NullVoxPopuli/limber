/**
 * @param {string} message
 * @param {unknown} test
 * @asserts test
 */
export function assert(message, test) {
  if (!test) {
    throw new Error(message);
  }
}

let i = 0;

export function nextId() {
  return `repl_${i++}`;
}

export const fakeDomain = 'repl.sdk';
export const tgzPrefix = 'file:///tgz.repl.sdk/';
export const unzippedPrefix = 'file:///tgz.repl.sdk/unzipped';

export function prefix_tgz(url) {
  return `${tgzPrefix}${url}`;
}
