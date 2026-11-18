import { isRecord } from '../../utils.js';
import { renderEmber } from './render.js';

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
      const [{ template }, helpers, { on }] = await Promise.all([
        api.tryResolve('@ember/template-compiler/runtime'),
        api.tryResolve('@ember/helper'),
        api.tryResolve('@ember/modifier'),
      ]);

      const component = template(text, {
        scope: () => ({
          /**
           * The keywords of gjs. They come from the Ember of this compile,
           * because helpers from another Ember have no manager in it.
           */
          array: helpers.array,
          concat: helpers.concat,
          fn: helpers.fn,
          get: helpers.get,
          hash: helpers.hash,
          on,
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
      const destroy = await renderEmber(config, element, compiled, extra, compiler);

      compiler.announce('info', 'Ember Island Rendered');

      return destroy;
    },
  };

  return hbsCompiler;
}
