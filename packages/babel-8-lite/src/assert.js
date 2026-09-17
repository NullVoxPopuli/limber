/**
 * Babel 8 imports `node:assert`, and uses only `assert()` and `assert.fail()`.
 */
export default function assert(value, message) {
  if (!value) assert.fail(message);
}

assert.ok = assert;

assert.fail = function fail(message) {
  throw message instanceof Error ? message : new Error(message ?? 'Assertion failed');
};
