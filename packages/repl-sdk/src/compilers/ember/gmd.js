/**
 * @typedef {import('unified').Plugin} Plugin
 */
import { buildGmdModule } from '../../render-to-string.js';
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
   * @type {import('../../types.ts').Compiler}
   */
  const gmdCompiler = {
    /**
     * Two shapes come out of here.
     *
     * The runtime form returns a live component for the prose alone. Each
     * live codefence stays a separate island that `render` compiles and
     * mounts into its placeholder, so demos keep their own module, their own
     * owner, and the caller's `scope` object by reference.
     *
     * The renderToString form has no runtime to lean on: it has to hand back
     * one self-contained module, so every demo is compiled to source and
     * inlined. A live `scope` object cannot survive that trip, so build-time
     * demos see an empty scope.
     */
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

      const scope = {
        ...userOptions.scope,
        ...compileOptions.scope,
      };

      if (isRecord(options) && options.renderToString === true) {
        /** @type {Array<{ name: string, placeholderId: string, source: string }>} */
        const demos = [];

        let nth = 0;

        for (const info of result.codeBlocks) {
          const { format, flavor, code, placeholderId } = info;

          if (!api.canCompile(format, flavor).result) continue;

          nth++;

          const sub = await api.compileToSource(format, code, {
            ...(options ?? {}),
            flavor,
          });

          demos.push({ name: `Demo${nth}`, placeholderId, source: sub.source });
        }

        // Merging demo modules is the only thing here that needs an AST, so a
        // document with no live demos never asks the host for babel.
        let babel;

        if (demos.length) {
          const resolved = await api.tryResolve('@babel/standalone');

          babel = 'packages' in resolved ? resolved : resolved.default;
        }

        return { source: buildGmdModule({ babel, prose: result.text, demos }) };
      }

      const { template } = await api.tryResolve('@ember/template-compiler/runtime');

      const component = template(result.text, {
        scope: () => ({ ...scope }),
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

          const format = /** @type {string} */ (infoObj.format);
          const flavor = /** @type {string} */ (infoObj.flavor);

          if (!api.canCompile(format, flavor).result) {
            return;
          }

          const hasScope = flavor === 'ember' || format === 'gjs' || format === 'hbs';
          const subRender = await compiler.compile(format, /** @type {string} */ (infoObj.code), {
            ...compiler.optionsFor(format, flavor),
            flavor: flavor,
            // @ts-ignore
            ...(hasScope ? { scope: extra.scope } : {}),
          });

          const selector = `#${/** @type {string} */ (infoObj.placeholderId)}`;
          const target = element.querySelector(selector);

          assert(
            `Could not find placeholder / target element (using selector: \`${selector}\`). ` +
              `Could not render ${format} block.`,
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
