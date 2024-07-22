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
