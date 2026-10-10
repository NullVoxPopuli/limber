/**
 * @typedef {import('unified').Plugin} Plugin
 */
import { buildGmdModule } from '../../to-source.js';
import { assert, isRecord } from '../../utils.js';
import { buildCodeFenceMetaUtils } from '../markdown/utils.js';
import { makeOwner } from './owner.js';

let elementId = 0;

/**
 * @param {unknown} [ options ]
 * @returns {{
 *   scope: Record<string, unknown>,
 *   remarkPlugins: Plugin[],
 *   rehypePlugins: Plugin[],
 *   ShadowComponent: string | undefined,
 *   CopyComponent: string | undefined
 *   owner?: unknown | undefined
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
    owner: options?.owner,
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
   * @param {string} text
   * @param {Record<string, unknown>} options
   */
  function parse(text, options) {
    const compileOptions = filterOptions(options);

    return parseMarkdown(text, {
      remarkPlugins: [...userOptions.remarkPlugins, ...compileOptions.remarkPlugins],
      rehypePlugins: [...userOptions.rehypePlugins, ...compileOptions.rehypePlugins],
      isLive,
      isPreview,
      isBelow,
      needsLive,
      ALLOWED_FORMATS: allowedFormats,
      getFlavorFromMeta,
    });
  }

  /**
   * @type {import('../../types.ts').Compiler}
   */
  const gmdCompiler = {
    compile: async (text, options) => {
      const result = await parse(text, options);

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
    /**
     * At runtime, each live code fence is a separate island.
     * `render` compiles it and puts it in its placeholder.
     *
     * Source has no runtime, so here each demo is compiled to source,
     * and all of them go into the one module with the prose.
     */
    toSource: async (text, options) => {
      const result = await parse(text, options);

      /** @type {Array<{ name: string, placeholderId: string, source: string }>} */
      const demos = [];

      const imports = typeof options.imports === 'string' ? options.imports : '';

      for (const { format, flavor, code, placeholderId } of result.codeBlocks) {
        const { source } = await api.compileToSource(format, code, { flavor, imports });

        demos.push({ name: `Demo${demos.length + 1}`, placeholderId, source });
      }

      let babel;

      if (demos.length || imports.trim()) {
        const resolved = await api.tryResolve('@glimdown/babel-8-lite');

        babel = 'transform' in resolved ? resolved : resolved.default;
      }

      return buildGmdModule({ babel, prose: result.text, demos, imports });
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

      const { renderComponent } = await compiler.tryResolve('@ember/renderer');

      const args = /** @type {Record<string, unknown> | undefined} */ (
        extra && typeof extra === 'object' && 'args' in extra
          ? /** @type {Record<string, unknown>} */ (extra).args
          : undefined
      );

      // A fresh owner per render, like gjs/hbs do: template instances (and
      // their compiled handles) are cached per owner, but each renderComponent
      // call has its own program artifacts — sharing one owner across islands
      // would make glimmer reuse a compiled handle from another island's
      // program, blowing up with "Cannot read properties of null (reading
      // 'syscall')" the second time a singleton scope component is invoked.
      const result = renderComponent(compiled, {
        into: element,
        owner: makeOwner(userOptions.owner),
        ...(args ? { args } : {}),
      });

      const destroy = () => result.destroy();

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
            ).result
          ) {
            return;
          }

          const flavor = /** @type {string} */ (infoObj.flavor);
          const hasScope =
            flavor === 'ember' ||
            infoObj.format === 'gjs' ||
            infoObj.format === 'gts' ||
            infoObj.format === 'hbs';
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
