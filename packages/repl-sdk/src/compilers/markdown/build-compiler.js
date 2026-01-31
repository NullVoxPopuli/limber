/**
 * @typedef {import('unified').Plugin} UPlugin
 */
import rehypeRaw from 'rehype-raw';
import rehypeStringify from 'rehype-stringify';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypeSlug from 'rehype-slug';
import remarkGfm from 'remark-gfm';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import { unified } from 'unified';
import { visit } from 'unist-util-visit';

import { GLIMDOWN_PREVIEW, GLIMDOWN_RENDER } from './const.js';
import { liveCodeExtraction } from './live-code-extraction.js';
import { sanitizeForGlimmer } from './sanitize-for-glimmer.js';

/**
 * @param {import('./types').InternalOptions} options
 *
 * @returns {import('unified').Processor<import('hast').Root>}
 */
export function buildCompiler(options) {
  let compiler = unified().use(remarkParse).use(remarkGfm, { singleTilde: true });

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
      classList: ['repl-sdk__snippet'],
      ...options.code,
    },
    demo: {
      classList: ['repl-sdk__demo'],
      ...options.code,
    },
    isLive: options.isLive,
    isPreview: options.isPreview,
    isBelow: options.isBelow,
    needsLive: options.needsLive,
    ALLOWED_FORMATS: options.ALLOWED_FORMATS,
    getFlavorFromMeta: options.getFlavorFromMeta,
  });

  // .use(() => (tree) => visit(tree, (node) => console.log('i', node)))
  // remark rehype is needed to convert markdown to HTML
  // However, it also changes all the nodes, so we need another pass
  // to make sure our Glimmer-aware nodes are in tact
  // @ts-ignore - unified processor types are complex and change as plugins are added
  compiler = compiler
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeSlug)
    .use(rehypeAutolinkHeadings);

  // Convert invocables to raw format, so Glimmer can invoke them
  // @ts-ignore - unified processor types are complex and change as plugins are added
  compiler = compiler.use(() => (/** @type {unknown} */ tree) => {
    visit(/** @type {import('hast').Root} */ (tree), function (node) {
      // We rely on an implicit transformation of data.hProperties => properties
      const nodeObj = /** @type {Record<string, unknown>} */ (/** @type {unknown} */ (node));
      const properties = /** @type {Record<string, unknown>} */ (
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

  // @ts-ignore
  return compiler;
}
