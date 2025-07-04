/**
 * @param {string} message
 * @param {unknown} test
 * @returns {asserts test}
 */
export function assert(message, test) {
  if (!test) {
    throw new Error(message);
  }
}

let i = 0;

export function nextId() {
  i += 1;

  return `repl_${i}`;
}

export const fakeDomain = 'repl.sdk';
export const tgzPrefix = 'file:///tgz.repl.sdk/';
export const unzippedPrefix = 'file:///tgz.repl.sdk/unzipped';

/**
 * @param {string} url
 */
export function prefix_tgz(url) {
  return `${tgzPrefix}${url}`;
}

/**
 * @param {unknown} x
 * @returns {x is Record<string, unknown>}
 */
export function isRecord(x) {
  return typeof x === 'object' && x !== null && !Array.isArray(x);
}
