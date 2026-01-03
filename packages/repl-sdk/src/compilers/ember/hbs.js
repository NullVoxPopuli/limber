import { isRecord } from '../../utils.js';
// import { makeOwner } from './owner.js';
import { renderApp } from './render-app-island.js';

let elementId = 0;

/**
 * @param {unknown} [ options ]
 * @returns {{ scope: Record<string, unknown> }}
 */
function filterOptions(options) {
  if (!isRecord(options)) {
    return { scope: {} };
  }

  return {
    scope: /** @type {Record<string, unknown>}*/ (options?.scope || {}),
  };
}

/**
 * @type {import('../../types.ts').CompilerConfig['compiler']}
 */
export async function compiler(config, api) {
  /**
   * @type {import('../../types.ts').Compiler}
   */
  const hbsCompiler = {
    compile: async (text, options) => {
      const { template } = await api.tryResolve('@ember/template-compiler/runtime');

      const component = template(text, {
        scope: () => ({
          ...filterOptions(config).scope,
          ...filterOptions(options).scope,
        }),
      });

      /**
       * Some versions of ember implement the runtime template compiler incorrectly (albeit, correct enough for the constraints at the time).
       * So we need to wait longer than a microtask queue request could take.
       *
       * To make sure that the template is compiled, and "component"
       * has a value.
       *
       * See:
       * - https://github.com/emberjs/ember.js/issues/20913
       * - https://github.com/emberjs/ember.js/issues/20914
       */
      await new Promise(requestAnimationFrame);

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
      const attribute = `data-repl-sdk-ember-hbs-${elementId++}`;

      element.setAttribute(attribute, '');

      // ------------------------------------------------
      // https://github.com/emberjs/ember.js/issues/21023
      // ------------------------------------------------
      //
      // const { renderComponent } = await compiler.tryResolve('@ember/renderer');
      // const owner = makeOwner(config.owner);
      // const result = renderComponent(compiled, { into: element, owner });
      //
      // return () => result.destroy();
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

      return renderApp({
        element,
        selector: `[${attribute}]`,
        component: compiled,
        log: compiler.announce,
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
