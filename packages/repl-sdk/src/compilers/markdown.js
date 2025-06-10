/**
 * @typedef {import('unified').Plugin} Plugin
 */
import { assert, isRecord, nextId } from '../utils.js';

const GLIMDOWN_PREVIEW = Symbol('__GLIMDOWN_PREVIEW__');
const GLIMDOWN_RENDER = Symbol('__GLIMDOWN_RENDER__');

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

/**
 * @type {import('../types.ts').CompilerConfig}
 */
export const md = {
  compiler: async (config, api) => {
    // Try both possible structures
    const userOptions = filterOptions(/** @type {Record<string, unknown>} */ (config.userOptions)?.md || config);

    /**
     * @param {string} lang
     */
    function needsLive(lang) {
      if (!ALLOWED_FORMATS.includes(lang)) return false;

      return api.optionsFor(lang).needsLiveMeta;
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

    const [
      _rehypeRaw,
      _rehypeStringify,
      _remarkGfm,
      _remarkParse,
      _remarkRehype,
      _unified,
      _visit,
    ] = await api.tryResolveAll([
      'rehype-raw',
      'rehype-stringify',
      'remark-gfm',
      'remark-parse',
      'remark-rehype',
      'unified',
      'unist-util-visit',
    ]);

    /** @type {import('rehype-raw').default} */
    const rehypeRaw = _rehypeRaw.default;

    /** @type {import('rehype-stringify').default} */
    const rehypeStringify = _rehypeStringify.default;

    /** @type {import('remark-rehype').default} */
    const remarkRehype = _remarkRehype.default;

    /** @type {import('unified').unified} */
    const unified = _unified.unified;

    /** @type {import('remark-parse').default} */
    const remarkParse = _remarkParse.default;

    /** @type {import('remark-gfm').default} */
    const remarkGfm = _remarkGfm.default;

    /** @type {import('unist-util-visit').visit} */
    const visit = _visit.visit;

    // Should be safe
    // eslint-disable-next-line import/no-cycle
    const { compilers } = await import('../compilers.js');

    // No recursing for now.
    const ALLOWED_FORMATS = Object.keys(compilers).filter((format) => format !== 'md');

    /**
     * Swaps live codeblocks with placeholders that the compiler can then
     * use to insert compiled-from-other-sources' code into those placeholders.
     *
     * @type {import('unified').Plugin<[
     *   {
     *     demo: {
     *       classList: string[]
     *     },
     *     code: {
     *       classList: string[]
     *     }
     *   },
     * ], import('mdast').Root>}
     */
    function liveCodeExtraction(options) {
      let { code, demo } = options;
      let { classList: snippetClasses } = code || {};
      let { classList: demoClasses } = demo || {};

      snippetClasses ??= [];
      demoClasses ??= [];

      /**
       * @param {import('mdast').Code} node
       */
      function isRelevantCode(node) {
        if (node.type !== 'code') return false;

        let { meta, lang } = node;

        if (!lang) {
          return false;
        }

        meta = meta?.trim() ?? '';

        if (!isLive(meta, lang)) {
          return false;
        }

        if (!ALLOWED_FORMATS.includes(lang)) {
          return false;
        }

        return true;
      }

      /**
       * @param {import('mdast').Code} code
       * @param {string[]} [classes]
       */
      function enhance(code, classes = []) {
        code.data ??= {};
        code.data['hProperties'] ??= {};
        // This is secret-to-us-only API, so we don't really care about the type
        code.data['hProperties'][/** @type {string} */ (/** @type {unknown} */ (GLIMDOWN_PREVIEW))] = true;

        return {
          data: {
            hProperties: { className: classes },
          },
          type: 'div',
          hProperties: { className: classes },
          children: [code],
        };
      }

      /**
       * @template T
       * @param {T[]} array
       * @param {number} index
       * @param {T[]} replacement
       */
      function flatReplaceAt(array, index, replacement) {
        array.splice(index, 1, ...replacement);
      }

      // because we mutate the tree as we iterate,
      // we need to make sure we don't loop forever
      const seen = new Set();

      return function transformer(tree, file) {
        visit(tree, ['code'], function (node, index, parent) {
          if (parent === null || parent === undefined) return;
          if (index === null || index === undefined) return;
          if (node.type !== 'code') return;

          /** @type {import('mdast').Code} */
          const codeNode = node;

          let isRelevant = isRelevantCode(codeNode);

          if (!isRelevant) {
            let enhanced = enhance(codeNode, []); // Use empty classes for non-relevant code

            /** @type {unknown[]} */ (parent.children)[index] = /** @type {unknown} */ (enhanced);

            return 'skip';
          }

          if (seen.has(codeNode)) {
            return 'skip';
          }

          seen.add(codeNode);

          let { meta, lang, value } = codeNode;

          if (!lang) {
            return 'skip';
          }

          /**
           * Sometimes, meta is not required,
           * like with the `mermaid` language
           */
          if (!meta) {
            if (needsLive(lang)) {
              return 'skip';
            }
          }

          file.data.liveCode ??= [];

          let code = value.trim();
          let id = nextId();

          let invokeNode = /** @type {import('mdast').Html} */ ({
            type: 'html',
            data: {
              hProperties: { [/** @type {string} */ (/** @type {unknown} */ (GLIMDOWN_RENDER))]: true },
            },
            value: `<div id="${id}" class="${demoClasses}"></div>`,
          });

          let wrapper = enhance(codeNode, snippetClasses);

          /** @type {unknown[]} */ (file.data.liveCode).push({
            format: lang,
            /* flavor,  */
            code,
            placeholderId: id,
            meta,
          });

          let live = isLive(meta || '', lang);
          let preview = isPreview(meta || '');
          let below = isBelow(meta || '');

          if (live && preview && below) {
            flatReplaceAt(/** @type {unknown[]} */ (parent.children), index, [/** @type {unknown} */ (wrapper), /** @type {unknown} */ (invokeNode)]);

            return 'skip';
          }

          if (live && preview) {
            flatReplaceAt(/** @type {unknown[]} */ (parent.children), index, [/** @type {unknown} */ (invokeNode), /** @type {unknown} */ (wrapper)]);

            return 'skip';
          }

          if (live) {
            /** @type {unknown[]} */ (parent.children)[index] = /** @type {unknown} */ (invokeNode);

            return 'skip';
          }

          /** @type {unknown[]} */ (parent.children)[index] = /** @type {unknown} */ (wrapper);

          return;
        });
      };
    }

    /**
     * @type {import('unified').Plugin<[], import('hast').Root>}
     */
    function sanitizeForGlimmer(/* options */) {
      return function transformer(tree) {
        visit(tree, 'element', function visitor(node) {
          if (node.type === 'element' && 'tagName' in node) {
            const element = /** @type {import('hast').Element} */ (node);
            
            if (!['pre', 'code'].includes(element.tagName)) return;

            visit(node, 'text', function textVisitor(textNode) {
              if (textNode.type === 'text') {
                const text = /** @type {import('hast').Text} */ (textNode);

                text.value = text.value.replace(/{{/g, '\\{{');
              }
            });

            return 'skip';
          }
        });
      };
    }

    /**
     * @param {{ remarkPlugins?: Plugin[], rehypePlugins?: Plugin[], CopyComponent?: string, ShadowComponent?: string }} options
     * @returns {unknown}
     */
    function buildCompiler(options) {
      // @ts-ignore - unified processor types are complex and change as plugins are added
      let compiler = unified().use(remarkParse).use(remarkGfm);

      /**
       * If this were "use"d after `remarkRehype`,
       * remark is gone, and folks would need to work with rehype trees
       */
      if (options.remarkPlugins) {
        options.remarkPlugins.forEach((plugin) => {
          // Arrays are how plugins are passed options (for some reason?)
          // why not just invoke the the function?
          if (Array.isArray(plugin)) {
            // @ts-ignore - unified processor types are complex and change as plugins are added
            compiler = compiler.use(plugin[0], ...plugin.slice(1));
          } else {
            // @ts-ignore - unified processor types are complex and change as plugins are added
            compiler = compiler.use(plugin);
          }
        });
      }

      // TODO: we only want to do this when we have pre > code.
      //       code can exist inline.
      // @ts-ignore - unified processor types are complex and change as plugins are added
      compiler = compiler.use(liveCodeExtraction, {
        code: {
          classList: ['glimdown-snippet', 'relative'],
        },
        demo: {
          classList: ['glimdown-render'],
        },
      });

      // .use(() => (tree) => visit(tree, (node) => console.log('i', node)))
      // remark rehype is needed to convert markdown to HTML
      // However, it also changes all the nodes, so we need another pass
      // to make sure our Glimmer-aware nodes are in tact
      // @ts-ignore - unified processor types are complex and change as plugins are added
      compiler = compiler.use(remarkRehype, { allowDangerousHtml: true });

      // Convert invocables to raw format, so Glimmer can invoke them
      // @ts-ignore - unified processor types are complex and change as plugins are added
      compiler = compiler.use(() => (/** @type {unknown} */ tree) => {
        visit(/** @type {import('hast').Root} */ (tree), function (node) {
          // We rely on an implicit transformation of data.hProperties => properties
          let nodeObj = /** @type {Record<string, unknown>} */ (/** @type {unknown} */ (node));
          let properties = /** @type {Record<string, unknown>} */ (
            typeof node === 'object' && node !== null && 'properties' in node ? node.properties : {}
          );

          if (properties?.[/** @type {string} */ (/** @type {unknown} */ (GLIMDOWN_PREVIEW))]) {
            return 'skip';
          }

          if (nodeObj.type === 'element' || ('tagName' in nodeObj && nodeObj.tagName === 'code')) {
            if (properties?.[/** @type {string} */ (/** @type {unknown} */ (GLIMDOWN_RENDER))]) {
              nodeObj.type = 'glimmer_raw';

              return;
            }

            return 'skip';
          }

          if (nodeObj.type === 'text' || nodeObj.type === 'raw') {
            // definitively not the better way, but this is supposed to detect "glimmer" nodes
            if (
              'value' in nodeObj &&
              typeof nodeObj.value === 'string' &&
              nodeObj.value.match(/<\/?[_A-Z:0-9].*>/g)
            ) {
              nodeObj.type = 'glimmer_raw';
            }

            nodeObj.type = 'glimmer_raw';

            return 'skip';
          }

          return;
        });
      });

      if (options.rehypePlugins) {
        options.rehypePlugins.forEach((plugin) => {
          // Arrays are how plugins are passed options (for some reason?)
          // why not just invoke the the function?
          if (Array.isArray(plugin)) {
            // @ts-ignore - unified processor types are complex and change as plugins are added
            compiler = compiler.use(plugin[0], ...plugin.slice(1));
          } else {
            // @ts-ignore - unified processor types are complex and change as plugins are added
            compiler = compiler.use(plugin);
          }
        });
      }

      // @ts-ignore - unified processor types are complex and change as plugins are added
      compiler = compiler
        .use(rehypeRaw, { passThrough: ['glimmer_raw', 'raw'] })
        .use(() => (/** @type {unknown} */ tree) => {
          visit(/** @type {import('hast').Root} */ (tree), 'glimmer_raw', (node) => {
            /** @type {Record<string, unknown>} */ (node).type = 'raw';
          });
        });

      // @ts-ignore - unified processor types are complex and change as plugins are added
      compiler = compiler.use(sanitizeForGlimmer);

      // Finally convert to string! oofta!
      // @ts-ignore - unified processor types are complex and change as plugins are added
      compiler = compiler.use(rehypeStringify, {
        collapseEmptyAttributes: true,
        closeSelfClosing: true,
        allowParseErrors: true,
        allowDangerousCharacters: true,
        allowDangerousHtml: true,
      });

      return compiler;
    }

    /**
     * @param {string} input
     * @param {{ CopyComponent?: string, ShadowComponent?: string, remarkPlugins?: Plugin[], rehypePlugins?: Plugin[] }} options
     * @returns {Promise<{ text: string; codeBlocks: { lang: string; flavor: string; code: string; name: string }[] }>}
     */
    async function parseMarkdown(input, options = {}) {
      let markdownCompiler = buildCompiler(options);
      // @ts-ignore - markdownCompiler is typed as unknown due to unified processor complexity
      let processed = await markdownCompiler.process(input);
      // @ts-ignore - processed is typed as unknown due to unified processor complexity
      let liveCode = /** @type {{ lang: string; flavor: string; code: string; name: string }[]} */ (
        processed.data.liveCode || []
      );
      // @ts-ignore - processed is typed as unknown due to unified processor complexity
      let templateOnly = processed.toString();

      return { text: templateOnly, codeBlocks: liveCode };
    }

    /**
     * @type {import('../types.ts').Compiler}
     */
    return {
      compile: async (text, options) => {
        const compileOptions = filterOptions(options);
        let result = await parseMarkdown(text, {
          remarkPlugins: [...userOptions.remarkPlugins, ...compileOptions.remarkPlugins],
          rehypePlugins: [...userOptions.rehypePlugins, ...compileOptions.rehypePlugins],
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
            
            if (!api.canCompile(/** @type {string} */ (infoObj.format), /** @type {string} */ (infoObj.flavor))) {
              return;
            }

            let flavor = /** @type {string} */ (infoObj.flavor);
            let subElement = await compiler.compile(/** @type {string} */ (infoObj.format), /** @type {string} */ (infoObj.code), {
              ...compiler.optionsFor(/** @type {string} */ (infoObj.format), flavor),
              flavor: flavor,
            });

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
