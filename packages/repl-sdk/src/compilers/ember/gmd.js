/**
 * @typedef {import('unified').Plugin} Plugin
 */
import { buildGmdModule } from '../../render-to-string.js';
import { isRecord } from '../../utils.js';
import { buildCodeFenceMetaUtils } from '../markdown/utils.js';

let elementId = 0;
let scopeNonce = 0;

/**
 * Slot on `globalThis` where gmd's runtime path stashes the live scope object
 * so the emitted ES module can read it back at evaluation time. String-keyed
 * (rather than Symbol-keyed) so TypeScript accepts the indexed access on
 * `globalThis` without a cast — `globalThis[string]` is well-typed as
 * `unknown`.
 *
 * @param {number} id
 */
function scopeKey(id) {
  return `__replSdk__gmdScope__${id}`;
}

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
     *     an empty scope. The runtime form stashes the live scope object
     *     on `globalThis[Symbol.for('repl-sdk:gmd-scope:N')]` and emits a
     *     module that reads it back and destructures its keys into the
     *     template's `scope: () => ({...})` call.
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

      const id = ++scopeNonce;
      const key = scopeKey(id);

      // `Reflect.set` writes the dynamic key onto `globalThis` without
      // needing a cast — `typeof globalThis` doesn't have a string index
      // signature, but `Reflect.set` accepts any `PropertyKey`.
      Reflect.set(globalThis, key, scope);

      const source = buildGmdModule({
        prose: result.text,
        demos,
        templateModule: '@ember/template-compiler/runtime',
        scope: {
          expression: `globalThis['${key}']`,
          keys: Object.keys(scope),
        },
      });

      return { compiled: source, ...result, scope, __replSdkScopeNonce: id };
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

      return () => {
        result.destroy();

        // Release the stashed scope so it's eligible for GC. The nonce was
        // attached to `extra` by `compile()` so we know exactly which slot
        // to clear.
        if (
          extra &&
          typeof extra === 'object' &&
          '__replSdkScopeNonce' in extra &&
          typeof extra.__replSdkScopeNonce === 'number'
        ) {
          Reflect.deleteProperty(globalThis, scopeKey(extra.__replSdkScopeNonce));
        }
      };
    },
  };

  return gmdCompiler;
}
