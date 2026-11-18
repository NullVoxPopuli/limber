import { isRecord } from '../../utils.js';

/**
 * @param {unknown} [owner]
 */
function makeOwner(owner) {
  /**
   * @param {string} method
   * @param {string} name
   */
  function forward(method, name) {
    if (!isRecord(owner)) return;

    const fn = owner[method];

    if (typeof fn !== 'function') return;

    return fn.call(owner, name);
  }

  return {
    name: 'inner owner',
    lookup: (/** @type {string} */ name) => forward('lookup', name),
    resolveRegistration: (/** @type {string} */ name) => forward('resolveRegistration', name),
    hasRegistration: (/** @type {string} */ name) => forward('hasRegistration', name),
    factoryFor: (/** @type {string} */ name) => forward('factoryFor', name),
  };
}

/**
 * Each render gets its own owner. Template instances are cached per owner,
 * but each `renderComponent` call has its own program. With a shared owner,
 * glimmer uses a compiled handle from the program of another render
 * ("Cannot read properties of null (reading 'syscall')").
 *
 * @param {{ owner?: unknown, versions?: Record<string, string> }} config
 * @param {Element} element
 * @param {unknown} component
 * @param {unknown} extra
 * @param {{ tryResolve: (name: string) => Promise<any> }} compiler
 * @returns {Promise<() => void>} destroys the render
 */
export async function renderEmber(config, element, component, extra, compiler) {
  const { renderComponent } = await compiler.tryResolve('@ember/renderer');

  /**
   * A pinned ember-source is a second Ember on the page,
   * and objects from the host's Ember do not work in it.
   */
  const owner = makeOwner(config.versions?.['ember-source'] ? undefined : config.owner);
  const args = isRecord(extra) && isRecord(extra.args) ? extra.args : {};

  const result = renderComponent(component, { into: element, owner, args });

  return () => result.destroy();
}
