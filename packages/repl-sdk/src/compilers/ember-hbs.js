import { renderApp } from './ember/render-app-island.js';

let elementId = 0;

/**
 *
 * @type {import('../types.ts').CompilerConfig['compiler']}
 */
export async function compiler(config, api) {
  let userOptions = config.userOptions || {};

  /**
   * @type {import('../types.ts').Compiler}
   */
  let hbsCompiler = {
    compile: async (text, options) => {
      // @ts-ignore
      const { template } = await api.tryResolve('@ember/template-compiler/runtime');

      let component = template(text, {
        scope: () => ({
          ...userOptions.scope,
          ...options.scope,
        }),
      });

      /**
       * Is this allowed here? or do I just return text,
       * and do the above in 'render'
       */
      return component;
    },
    render: async (element, compiled, extra, compiler) => {
      /**
       *
       * TODO: These will make things easier:
       *    https://github.com/emberjs/rfcs/pull/1099
       *    https://github.com/ember-cli/ember-addon-blueprint/blob/main/files/tests/test-helper.js
       */
      let attribute = `data-repl-sdk-ember-hbs-${elementId++}`;

      element.setAttribute(attribute, '');

      const [application, destroyable, resolver, router, route, testWaiters, runloop] =
        await compiler.tryResolveAll([
          '@ember/application',
          '@ember/destroyable',
          'ember-resolver',
          '@ember/routing/router',
          '@ember/routing/route',
          '@ember/test-waiters',
          '@ember/runloop',
        ]);

      // We don't want to await here, because we need to early
      // return the element so that the app can render in to it.
      // (Ember will only render in to an element if it's present in the DOM)
      renderApp({
        selector: `[${attribute}]`,
        component: compiled,
        modules: {
          application,
          destroyable,
          resolver,
          router,
          route,
          testWaiters,
          runloop,
        },
      });
    },
  };

  return hbsCompiler;
}
