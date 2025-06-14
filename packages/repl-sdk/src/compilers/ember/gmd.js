/**
 * @typedef {import('unified').Plugin} Plugin
 */
import { isRecord } from '../../utils.js';
import { buildCodeFenceMetaUtils } from '../markdown/utils.js';
import { renderApp } from './render-app-island.js';

let elementId = 0;

/**
 * @param {unknown} [ options ]
 * @returns {{
 *   remarkPlugins: Plugin[],
 *   rehypePlugins: Plugin[],
 *   topLevelScope: Record<string, unknown>,
 *   ShadowComponent: string | undefined,
 *   CopyComponent: string | undefined
 *   }}
 */
export function filterOptions(options) {
  if (!isRecord(options)) {
    return {
      remarkPlugins: [],
      rehypePlugins: [],
      topLevelScope: {},
      ShadowComponent: undefined,
      CopyComponent: undefined,
    };
  }

  return {
    remarkPlugins: /** @type {Plugin[]}*/ (options?.remarkPlugins || []),
    rehypePlugins: /** @type {Plugin[]}*/ (options?.rehypePlugins || []),
    topLevelScope: /** @type {Record<string, unknown>}*/ (options?.topLevelScope || {}),
    ShadowComponent: /** @type {string}*/ (options?.ShadowComponent),
    CopyComponent: /** @type {string}*/ (options?.CopyComponent),
  };
}

/**
 * @type {import('../../types.ts').CompilerConfig['compiler']}
 */
export async function compiler(config, api) {
  const userOptions = filterOptions(
    /** @type {Record<string, unknown>} */ (config.userOptions)?.gmd || config
  );

  const { isLive, isPreview, needsLive, allowedFormats, isBelow } = buildCodeFenceMetaUtils(api);

  const { parseMarkdown } = await import(/* @vite-ignore */ '../markdown/parse.js');

  /**
   * @type {import('../../types.ts').Compiler}
   */
  let gmdCompiler = {
    compile: async (text, options) => {
      const compileOptions = filterOptions(options);
      let result = await parseMarkdown(text, {
        remarkPlugins: [...userOptions.remarkPlugins, ...compileOptions.remarkPlugins],
        rehypePlugins: [...userOptions.rehypePlugins, ...compileOptions.rehypePlugins],
        isLive,
        isPreview,
        isBelow,
        needsLive,
        ALLOWED_FORMATS: allowedFormats,
      });

      const { template } = await api.tryResolve('@ember/template-compiler/runtime');

      let component = template(result.text, {
        scope: () => ({
          ...filterOptions(userOptions).topLevelScope,
          ...filterOptions(options).topLevelScope,
          // TODO: compile all the components from "result" and add them to scope here
        }),
      });

      return { compiled: component, ...result };
    },
    render: async (element, compiled, extra, compiler) => {
      /**
       *
       * TODO: These will make things easier:
       *    https://github.com/emberjs/rfcs/pull/1099
       *    https://github.com/ember-cli/ember-addon-blueprint/blob/main/files/tests/test-helper.js
       */
      let attribute = `data-repl-sdk-ember-gmd-${elementId++}`;

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

  return gmdCompiler;
}
