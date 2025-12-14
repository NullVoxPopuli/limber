/**
 * @typedef {import('unified').Plugin} Plugin
 */
import { assert, isRecord } from '../../utils.js';
import { buildCodeFenceMetaUtils } from '../markdown/utils.js';
import { renderApp } from './render-app-island.js';

let elementId = 0;

/**
 * @param {unknown} [ options ]
 * @returns {{
 *   scope: Record<string, unknown>,
 *   remarkPlugins: Plugin[],
 *   rehypePlugins: Plugin[],
 *   ShadowComponent: string | undefined,
 *   CopyComponent: string | undefined
 *   }}
 */
export function filterOptions(options) {
  if (!isRecord(options)) {
    return {
      scope: {},
      remarkPlugins: [],
      rehypePlugins: [],
      ShadowComponent: undefined,
      CopyComponent: undefined,
    };
  }

  return {
    scope: /** @type {Record<string, unknown>}*/ (options?.scope || {}),
    remarkPlugins: /** @type {Plugin[]}*/ (options?.remarkPlugins || []),
    rehypePlugins: /** @type {Plugin[]}*/ (options?.rehypePlugins || []),
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

  const { isLive, isPreview, needsLive, allowedFormats, getFlavorFromMeta, isBelow } =
    buildCodeFenceMetaUtils(api);

  const { parseMarkdown } = await import('../markdown/parse.js');

  /**
   * @type {import('../../types.ts').Compiler}
   */
  const gmdCompiler = {
    compile: async (text, options) => {
      const compileOptions = filterOptions(options);
      const result = await parseMarkdown(text, {
        remarkPlugins: [...userOptions.remarkPlugins, ...compileOptions.remarkPlugins],
        rehypePlugins: [...userOptions.rehypePlugins, ...compileOptions.rehypePlugins],
        isLive,
        isPreview,
        isBelow,
        needsLive,
        ALLOWED_FORMATS: allowedFormats,
        getFlavorFromMeta,
      });

      const { template } = await api.tryResolve('@ember/template-compiler/runtime');

      const scope = {
        ...filterOptions(userOptions).scope,
        ...filterOptions(options).scope,
      };

      const component = template(result.text, {
        scope: () => ({
          ...scope,
          // TODO: compile all the components from "result" and add them to scope here
          //       would this be better than the markdown style multiple islands
        }),
      });

      return { compiled: component, ...result, scope };
    },
    render: async (element, compiled, extra, compiler) => {
      /**
       *
       * TODO: These will make things easier:
       *    https://github.com/emberjs/rfcs/pull/1099
       *    https://github.com/ember-cli/ember-addon-blueprint/blob/main/files/tests/test-helper.js
       */
      const attribute = `data-repl-sdk-ember-gmd-${elementId++}`;

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
      const destroy = await renderApp({
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

      /**
       * @type {(() => void)[]}
       */
      const destroyables = [];

      await Promise.all(
        /** @type {unknown[]} */ (extra.codeBlocks).map(async (/** @type {unknown} */ info) => {
          /** @type {Record<string, unknown>} */
          const infoObj = /** @type {Record<string, unknown>} */ (info);

          if (
            !api.canCompile(
              /** @type {string} */ (infoObj.format),
              /** @type {string} */ (infoObj.flavor)
            )
          ) {
            return;
          }

          const flavor = /** @type {string} */ (infoObj.flavor);
          const hasScope =
            flavor === 'ember' || infoObj.format === 'gjs' || infoObj.format === 'hbs';
          const subRender = await compiler.compile(
            /** @type {string} */ (infoObj.format),
            /** @type {string} */ (infoObj.code),
            {
              ...compiler.optionsFor(/** @type {string} */ (infoObj.format), flavor),
              flavor: flavor,
              // @ts-ignore
              ...(hasScope
                ? {
                    scope: extra.scope,
                  }
                : {}),
            }
          );

          const selector = `#${/** @type {string} */ (infoObj.placeholderId)}`;
          const target = element.querySelector(selector);

          assert(
            `Could not find placeholder / target element (using selector: \`${selector}\`). ` +
              `Could not render ${/** @type {string} */ (infoObj.format)} block.`,
            target
          );

          destroyables.push(subRender.destroy);
          target.appendChild(subRender.element);
        })
      );

      return () => {
        for (const subDestroy of destroyables) {
          subDestroy();
        }

        destroy();
      };
    },
  };

  return gmdCompiler;
}
