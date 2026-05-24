/**
 * @typedef {import('unified').Plugin} Plugin
 */
import { buildGmdModule } from '../../render-to-string.js';
import { assert, isRecord } from '../../utils.js';
import { buildCodeFenceMetaUtils } from '../markdown/utils.js';

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

      if (isRecord(options) && options.renderToString) {
        return compileToSource(result, options);
      }

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

      const { renderComponent } = await compiler.tryResolve('@ember/renderer');

      const args = /** @type {Record<string, unknown> | undefined} */ (
        extra && typeof extra === 'object' && 'args' in extra
          ? /** @type {Record<string, unknown>} */ (extra).args
          : undefined
      );

      const result = renderComponent(compiled, {
        into: element,
        owner: userOptions.owner,
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
            )
          ) {
            return;
          }

          const flavor = /** @type {string} */ (infoObj.flavor);
          const hasScope =
            flavor === 'ember' || infoObj.format === 'gjs' || infoObj.format === 'hbs';
          const subRender = /** @type {{ element: HTMLElement, destroy: () => void }} */ (
            await compiler.compile(
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
            )
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

  /**
   * Build-time path: turn a parsed markdown result into a single ES module
   * string that the host app's compiler can take to SSG-renderable output.
   *
   * Strategy:
   *
   *   1. For every live code block, recursively call the sub-compiler in
   *      `renderToString: true` mode to get its babel-compiled module string.
   *   2. Split each demo module into `{ imports, body }` and wrap the body in
   *      `const Demo<N> = (() => { ...; return _component; })();`.
   *   3. Replace the `<div id="placeholderId">…</div>` HTML placeholder for
   *      each demo with a `<Demo<N> />` Glimmer component invocation.
   *   4. Emit one module that imports `template` from
   *      `@ember/template-compiler` (build-time), declares all the inlined
   *      demo consts, and `export default`s a `template(prose, { scope })`
   *      call referencing them.
   *
   * The output is *not* itself precompiled — it's a `.gjs`-shaped JS module
   * that the host app's content-tag + babel pipeline will precompile to wire
   * format, the same way it would for any other live `.gjs` file.
   *
   * @param {{ text: string, codeBlocks: Array<Record<string, unknown>> }} result
   * @param {Record<string, unknown>} options
   * @returns {Promise<{ source: string }>}
   */
  async function compileToSource(result, options) {
    /** @type {Array<{ name: string, placeholderId: string, source: string }>} */
    const demos = [];

    let nth = 0;

    for (const info of result.codeBlocks) {
      const format = /** @type {string} */ (info.format);
      const flavor = /** @type {string | undefined} */ (info.flavor);
      const code = /** @type {string} */ (info.code);
      const placeholderId = /** @type {string} */ (info.placeholderId);

      if (!api.canCompile(format, flavor).result) {
        continue;
      }

      nth++;

      const demoName = `Demo${nth}`;
      const subOptions = {
        ...(options ?? {}),
        flavor,
        renderToString: true,
      };

      // `api` exposes `compileToSource` so a compiler can recursively ask for
      // the build-time form of another compiler — gmd needs this to inline
      // each live code block into the single emitted module.
      const subResult = await api.compileToSource(format, code, subOptions);

      demos.push({ name: demoName, placeholderId, source: subResult.source });
    }

    return { source: buildGmdModule({ prose: result.text, demos }) };
  }
}
