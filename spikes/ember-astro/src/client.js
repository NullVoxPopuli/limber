// waiting on renderComponent
// https://github.com/emberjs/ember.js/pull/20962

/**
 * @type {WeakMap<HTMLElement, unknown>}
 */
const existingApplications = new WeakMap();

export default function emberAstroClientRenderer(element) {
  return async (component, props, slotted) => {
    let { Compiler } = await import('repl-sdk');
    let { compiler } = await import('repl-sdk/compilers/ember/gjs');

    let instance = new Compiler();
    let gjs = await compiler();

    // const { renderAppIsland } = await import('./render-app-island.js');
    console.log({ component, props, slotted });

    if (!element.hasAttribute('ssr')) return;

    if (existingApplications.has(element)) {
      console.log('Should update props?');
      // existingApplications.get(element)!.setProps(resolvedProps);
      return;
    }

    await gjs.render(element, component, { compiled: component }, instance);
    // let result = await renderAppIsland({ element, component });

    // existingApplications.set(element, result);
    // element.addEventListener('astro:unmount', () => result.destroy(), { once: true });
  };
}
