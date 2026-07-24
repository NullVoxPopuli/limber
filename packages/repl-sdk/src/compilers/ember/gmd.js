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
    /**
     * The runtime and renderToString paths share most of their work — both
     * parse the markdown, recursively compile every live demo to a JS
     * source string, then call `buildGmdModule` to inline those demos into
     * a single `.gjs`-shaped module.
     *
     * The only forks are:
     *
     *   - Which `@ember/template-compiler` to import. Runtime form uses
     *     `/runtime` (the parse-and-compile-at-execution-time variant);
     *     renderToString uses the build-time form so the host app's babel
     *     pipeline can precompile the `template()` call to wire format.
     *
     *   - How runtime scope crosses the source boundary. The build-time
     *     form can't reference a live JS object, so renderToString gets
     *     an empty scope. The runtime form registers the live scope object
     *     behind a virtual ES module specifier via `api.provide` and emits
     *     a module that `import * as __scope__ from '<specifier>'`. The
     *     Compiler's existing `manual:` resolver handles the bridge, so
     *     gmd never touches `globalThis` directly.
     */
    compile: async (text, options, compileApi) => {
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

      const renderToString = isRecord(options) && options.renderToString === true;
      const scope = {
        ...userOptions.scope,
        ...compileOptions.scope,
      };

      if (renderToString) {
        const source = buildGmdModule({
          prose: result.text,
          demos,
          templateModule: '@ember/template-compiler',
          scope: null,
        });

        return { source };
      }

      // `compileApi.provideScope` registers the live scope behind a
      // Compiler-generated specifier and tracks it as part of this
      // compile's lifecycle. The Compiler releases it when destroy fires;
      // gmd doesn't need to track an unregister callback.
      assert(
        `gmd needs the per-compile API (3rd argument to compile) to provide its scope. ` +
          `It looks like the Compiler did not pass one.`,
        compileApi
      );

      const { specifier } = compileApi.provideScope(scope);

      const source = buildGmdModule({
        prose: result.text,
        demos,
        templateModule: '@ember/template-compiler/runtime',
        scope: {
          specifier,
          keys: Object.keys(scope),
        },
      });

      return { compiled: source, ...result, scope };
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

      return () => result.destroy();
    },
  };

  return gmdCompiler;
}
