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
      const [{ markdown }, { codeLanguages }] = await Promise.all([
        import('@codemirror/lang-markdown'),
        import('codemirror-lang-glimdown'),
      ]);

      return markdown({
        codeLanguages,
      });
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
          ALLOWED_FORMATS: allowedFormats,
          getFlavorFromMeta,
        });
        let escaped = result.text.replace(/`/g, '\\`');

        return { compiled: `export default \`${escaped}\``, ...result };
      },
      render: async (element, compiled, extra, compiler) => {
        element.innerHTML = /** @type {string} */ (compiled);

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

            let flavor = /** @type {string} */ (infoObj.flavor);
            let subRender = await compiler.compile(
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

            destroyables.push(subRender.destroy);
            target.appendChild(subRender.element);
          })
        );

        compiler.announce('info', 'Done');

        return () => {
          for (let subDestroy of destroyables) {
            subDestroy();
          }
        };
      },
    };
  },
};
