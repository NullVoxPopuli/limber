/**
 * This is a replacement module for `@embroider/macros` which is a babel plugin that was never meant to be ran in the browser.
 *
 * This provides runtime implementations of all the macros' behaviors.
 */

export function macroCondition(result) {
  return result;
}

/**
 * This can probably be implemented
 */
export function dependencySatisfies() {
  return true;
}

export function isDevelopingApp() {
  return true;
}
