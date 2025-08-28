// waiting on renderComponent
// https://github.com/emberjs/ember.js/pull/20962
import { renderAppIsland } from './render-app-island.js';

/**
 * @type {WeakMap<HTMLElement, unknown>}
 */
const existingApplications = new WeakMap();

export default function emberAstroClientRenderer(element) {
  return async (component, props, slotted) => {
    console.log({ component, props, slotted });

    if (!element.hasAttribute('ssr')) return;

    if (existingApplications.has(element)) {
      console.log('Should update props?');
      // existingApplications.get(element)!.setProps(resolvedProps);
      return;
    }

    let result = await renderAppIsland({ element, component });

    existingApplications.set(element, result);
    element.addEventListener('astro:unmount', () => result.destroy(), { once: true });
  };
}
