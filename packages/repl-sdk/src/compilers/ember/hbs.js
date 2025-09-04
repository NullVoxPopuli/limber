import { isRecord } from '../../utils.js';

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
      const attribute = `data-repl-sdk-ember-hbs-${elementId++}`;

      element.setAttribute(attribute, '');

      const renderer = await compiler.tryResolve('@ember/renderer');
      const { renderComponent } = renderer;

      compiler.announce('info', 'Booting Ember Island');

      const result = renderComponent(compiled, { into: element });

      compiler.announce('info', 'Ember Island Rendered');

      return () => {
        result.destroy();
      };
    },
  };

  return hbsCompiler;
}
