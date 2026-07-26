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

export function resetIdCounter() {
  i = 0;
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

/**
 * Builds the most useful human-readable message from a thrown error.
 *
 * SWC (via content-tag) throws Errors whose `message` is only
 * "Parse Error at <file>:<line>:<column>" — the explanation of what's
 * wrong and the code-frame live on a non-standard `source_code` property
 * (and `stack` is nothing but wasm frames).
 *
 * @param {unknown} error
 * @returns {string}
 */
export function errorMessage(error) {
  if (!isRecord(error)) {
    return String(error);
  }

  const parts = [];

  if ('message' in error && error.message) {
    parts.push(String(error.message));
  }

  if ('source_code' in error && error.source_code) {
    parts.push(String(error.source_code));
  }

  if (parts.length === 0) {
    return String(error);
  }

  return parts.join('\n\n');
}
