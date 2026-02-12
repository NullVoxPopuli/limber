/**
 * @typedef {import('unified').Plugin} UPlugin
 */
import rehypeRaw from 'rehype-raw';
import rehypeStringify from 'rehype-stringify';
import remarkGfm from 'remark-gfm';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import { unified } from 'unified';
import { visit } from 'unist-util-visit';

import { GLIMDOWN_PREVIEW, GLIMDOWN_RENDER } from './const.js';
import { headingId } from './heading-id.js';
import { liveCodeExtraction } from './live-code-extraction.js';
import { sanitizeForGlimmer } from './sanitize-for-glimmer.js';

/**
 * @param {import('./types').InternalOptions} options
 *
 * @returns {import('unified').Processor<import('hast').Root>}
 */
export function buildCompiler(options) {
  let compiler = unified().use(remarkParse).use(remarkGfm, { singleTilde: true }).use(headingId);

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

  // Mark raw HTML components (PascalCase) before remarkRehype processes them
  // @ts-ignore - unified processor types are complex and change as plugins are added
  compiler = compiler.use(() => (tree) => {
    visit(tree, 'html', function (node) {
      // Check if this html node is a PascalCase component (opening or closing tag)
      if (typeof node.value === 'string' && node.value.match(/^<\/?[A-Z][a-zA-Z0-9]/)) {
        // Add a marker to the node's data that remarkRehype will preserve
        // remark-rehype with allowDangerousHtml will turn this into a text node,
        // and the data should be preserved
        if (!node.data) node.data = {};
        node.data.isPascalCaseComponent = true;
      }
    });

    // After markinghtml nodes, also visit paragraphs to mark their children
    visit(tree, 'paragraph', (paragraph) => {
      if (paragraph.children) {
        for (let i = 0; i < paragraph.children.length; i++) {
          const child = paragraph.children[i];

          if (
            child.type === 'html' &&
            typeof child.value === 'string' &&
            child.value.match(/^<\/?[A-Z][a-zA-Z0-9]/)
          ) {
            if (!child.data) child.data = {};
            child.data.isPascalCaseComponent = true;
          }
        }
      }
    });
  });

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
      const nodeObj = /** @type {Record<string, unknown>} */ (/** @type {unknown} */ (node));
      const properties = /** @type {Record<string, unknown>} */ (
        typeof node === 'object' && node !== null && 'properties' in node ? node.properties : {}
      );

      if (properties?.[/** @type {string} */ (/** @type {unknown} */ (GLIMDOWN_PREVIEW))]) {
        return 'skip';
      }

      // Check for PascalCase elements FIRST before checking for code elements
      const tagName = /** @type {string | undefined} */ (nodeObj.tagName);

      if (tagName && /^[A-Z]/.test(tagName)) {
        nodeObj.type = 'glimmer_raw';

        return 'skip';
      }

      if (nodeObj.type === 'element' || ('tagName' in nodeObj && nodeObj.tagName === 'code')) {
        if (properties?.[/** @type {string} */ (/** @type {unknown} */ (GLIMDOWN_RENDER))]) {
          nodeObj.type = 'glimmer_raw';

          return;
        }

        return 'skip';
      }

      // Check for nodes with values (text, raw, html, etc.)
      if ('value' in nodeObj && typeof nodeObj.value === 'string') {
        // Check if this raw node was marked as a PascalCase component in remark phase
        const nodeData = /** @type {Record<string, unknown> | undefined} */ (
          typeof node === 'object' && node !== null && 'data' in node ? node.data : undefined
        );

        if (nodeData?.isPascalCaseComponent) {
          nodeObj.type = 'glimmer_raw';

          return 'skip';
        }

        // Match raw PascalCase components in text that haven't been escaped yet
        // Pattern: <PascalCaseName followed by whitespace, > or @
        if (
          (nodeObj.type === 'text' || nodeObj.type === 'raw' || nodeObj.type === 'html') &&
          nodeObj.value.match(/<\/?[A-Z][a-zA-Z0-9]*(\s|>|@)/)
        ) {
          nodeObj.type = 'glimmer_raw';

          return 'skip';
        }

        // Let normal nodes be processed for escaping
        return;
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
