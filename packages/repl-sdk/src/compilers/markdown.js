/**
 * @typedef {import('unified').Plugin} Plugin
 */
import { assert, isRecord } from '../utils.js';

/**
 * @param {unknown} [ options ]
 * @returns {{ remarkPlugins: Plugin[], rehypePlugins: Plugin[] }}
 */
function filterOptions(options) {
  if (!isRecord(options)) {
    return { remarkPlugins: [], rehypePlugins: [] };
  }

  return {
    remarkPlugins: /** @type {Plugin[]}*/ (options?.remarkPlugins || []),
    rehypePlugins: /** @type {Plugin[]}*/ (options?.rehypePlugins || []),
  };
}

export function isNotMarkdownLike(lang) {
  return lang !== 'md' && lang !== 'gmd' && lang !== 'mdx';
}

/**
 * @type {import('../types.ts').CompilerConfig}
 */
export const md = {
  compiler: async (config, api) => {
    const ALLOWED_FORMATS = api.getAllowedFormats().filter(isNotMarkdownLike);

    // Try both possible structures
    const userOptions = filterOptions(
      /** @type {Record<string, unknown>} */ (config.userOptions)?.md || config
    );

    /**
     * @param {string} lang
     */
    function needsLive(lang) {
      if (!ALLOWED_FORMATS.includes(lang)) return false;

      return api.optionsFor(lang).needsLiveMeta ?? true;
    }

    /**
     * @param {string} meta
     * @param {string} lang
     */
    function isLive(meta, lang) {
      if (!needsLive(lang)) return true;
      if (!meta) return false;

      return meta.includes('live');
    }

    /**
     * @param {string} meta
     */
    function isPreview(meta) {
      if (!meta) return false;

      return meta.includes('preview');
    }

    /**
     * @param {string} meta
     */
    function isBelow(meta) {
      if (!meta) return false;

      return meta.includes('below');
    }

    // No recursing for now.

    const { parseMarkdown } = await import(/* @vite-ignore */ './markdown/parse.js');

    /**
     * @type {import('../types.ts').Compiler}
     */
    return {
      compile: async (text, options) => {
        const compileOptions = filterOptions(options);
        let result = await parseMarkdown(text, {
          remarkPlugins: [...userOptions.remarkPlugins, ...compileOptions.remarkPlugins],
          rehypePlugins: [...userOptions.rehypePlugins, ...compileOptions.rehypePlugins],
          isLive,
          isPreview,
          isBelow,
          needsLive,
          ALLOWED_FORMATS,
        });
        let escaped = result.text.replace(/`/g, '\\`');

        return { compiled: `export default \`${escaped}\``, ...result };
      },
      render: async (element, compiled, extra, compiler) => {
        element.innerHTML = /** @type {string} */ (compiled);

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

            let flavor = /** @type {string} */ (infoObj.flavor);
            let subElement = await compiler.compile(
              /** @type {string} */ (infoObj.format),
              /** @type {string} */ (infoObj.code),
              {
                ...compiler.optionsFor(/** @type {string} */ (infoObj.format), flavor),
                flavor: flavor,
              }
            );

            let selector = `#${/** @type {string} */ (infoObj.placeholderId)}`;
            let target = element.querySelector(selector);

            assert(
              `Could not find placeholder / target element (using selector: \`${selector}\`). ` +
                `Could not render ${/** @type {string} */ (infoObj.format)} block.`,
              target
            );

            target.appendChild(subElement);
          })
        );
      },
    };
  },
};
