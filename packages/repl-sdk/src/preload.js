/**
 * The modules of the `preload` option, as the compile in progress loaded them.
 * The module loader is global for the page, so this is too.
 *
 * @type {Map<string, unknown>}
 */
let modules = new Map();

/**
 * A module of the `preload` option, as the compile in progress loaded it.
 * `undefined` when it did not load, such as a module that a pinned version does not have.
 *
 * @param {string} id
 * @returns {unknown}
 */
export function preloaded(id) {
  return modules.get(id);
}

/**
 * @param {Map<string, unknown>} next
 */
export function setPreloaded(next) {
  modules = next;
}
