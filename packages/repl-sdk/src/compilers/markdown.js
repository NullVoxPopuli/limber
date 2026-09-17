/**
 * @typedef {import('unified').Plugin} Plugin
 */
import { assert, isRecord } from '../utils.js';
import { buildCodeFenceMetaUtils } from './markdown/utils.js';

/**
 * @param {unknown} [ options ]
 * @returns {{ remarkPlugins: Plugin[], rehypePlugins: Plugin[] }}
 */
export function filterOptions(options) {
  if (!isRecord(options)) {
    return { remarkPlugins: [], rehypePlugins: [] };
  }

  return {
    remarkPlugins: /** @type {Plugin[]}*/ (options?.remarkPlugins || []),
    rehypePlugins: /** @type {Plugin[]}*/ (options?.rehypePlugins || []),
  };
}

/**
 * @type {import('../types.ts').CompilerConfig}
 */
export const md = {
  codemirror: {
    lang: async () => {
      const { glimdown } = await import('codemirror-lang-glimdown');

      /**
       * pre-configured markdown with GFM, and a few other extensions
       */
      return glimdown();
    },
  },
  compiler: async (config, api) => {
    const { isLive, isPreview, needsLive, allowedFormats, isBelow, getFlavorFromMeta } =
      buildCodeFenceMetaUtils(api);

    // Try both possible structures
    const userOptions = filterOptions(
      /** @type {Record<string, unknown>} */ (config.userOptions)?.md || config
    );

    // No recursing for now.

    const { parseMarkdown } = await import('./markdown/parse.js');

    /**
     * @type {import('../types.ts').Compiler}
     */
    return {
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
        const escaped = result.text.replace(/`/g, '\\`');

        return {
          compiled: `export default \`${escaped}\``,
          ...result,
          fileName: options?.fileName,
        };
      },
      render: async (element, compiled, extra, compiler) => {
        element.innerHTML = /** @type {string} */ (compiled);

        /**
         * @type {(() => void)[]}
         */
        const destroyables = [];

        const hostFileName = /** @type {string | undefined} */ (extra.fileName) ?? 'index.md';

        await Promise.all(
          /** @type {unknown[]} */ (extra.codeBlocks).map(
            async (/** @type {unknown} */ info, index) => {
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
              const subRender = await compiler.compile(
                /** @type {string} */ (infoObj.format),
                /** @type {string} */ (infoObj.code),
                {
                  ...compiler.optionsFor(/** @type {string} */ (infoObj.format), flavor),
                  flavor: flavor,
                  fileName: fenceFileName(
                    hostFileName,
                    index,
                    /** @type {string} */ (infoObj.format)
                  ),
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
            }
          )
        );

        compiler.announce('info', 'Done');

        return () => {
          for (const subDestroy of destroyables) {
            subDestroy();
          }
        };
      },
    };
  },
};

/**
 * Each fence is its own file, named after the document it is in:
 * the third fence of `index.md` is `index-3.gjs`.
 *
 * @param {string} hostFileName
 * @param {number} index
 * @param {string} format
 */
function fenceFileName(hostFileName, index, format) {
  const stem = hostFileName.replace(/\.[^.]+$/, '');

  return `${stem}-${index + 1}.${format}`;
}
