/**
 * @typedef {object} CodeBlock
 * @property {string} lang
 * @property {string} format
 * @property {string} code
 * @property {string} name
 */

/**
 * @typedef {object} ParseResult
 * @property {string} text
 * @property {CodeBlock[]} codeBlocks
 */

import remarkEscapeComponents, { REPL_LT } from '../../remark-escape-components.js';
import { buildCompiler } from './build-compiler.js';

export { buildCompiler } from './build-compiler.js';

/**
 * @param {string} input
 * @param {import('./types').InternalOptions} options
 * @returns {Promise<ParseResult>}
 */
export async function parseMarkdown(input, options) {
  const markdownCompiler =
    options?.compiler ??
    buildCompiler({
      ...options,
      remarkPlugins: [...(options?.remarkPlugins || []), remarkEscapeComponents],
    });
  const processed = await markdownCompiler.process(input);
  const liveCode = /** @type {CodeBlock[]} */ (processed.data.liveCode || []);
  // @ts-ignore - processed is typed as unknown due to unified processor complexity
  let templateOnly = processed.toString();

  // 1. Convert the placeholder written by the remark plugin to &#x3C;
  //    This placeholder survives the entire unified pipeline without being
  //    entity-encoded, so no double-escaping can occur.
  if (REPL_LT) {
    templateOnly = templateOnly.replaceAll(REPL_LT, '&#x3C;');
  }

  // 2. The pipeline may HTML-escape `<` for PascalCase component invocations
  //    that appear in regular markdown (outside code/backticks). Undo that so
  //    Glimmer can still invoke them.  We only unescape outside <code> elements
  //    (and outside <pre> blocks) to preserve escaping in code.
  templateOnly = unescapeComponentsOutsideCode(templateOnly);

  return { text: templateOnly, codeBlocks: liveCode };
}

/**
 * Undo HTML-escaping of PascalCase component tags that appear outside
 * `<code>` and `<pre>` blocks so Glimmer can invoke them.
 *
 * @param {string} html
 * @returns {string}
 */
function unescapeComponentsOutsideCode(html) {
  // Split by <pre>…</pre> blocks first – never touch code fences.
  const parts = html.split(/(<pre[\s\S]*?<\/pre>)/gi);

  for (let i = 0; i < parts.length; i++) {
    // Only touch content outside <pre>
    if (i % 2 === 0) {
      // Split by <code>…</code> so we skip inline code too
      const codeParts = parts[i].split(/(<code[^>]*>[\s\S]*?<\/code>)/gi);

      for (let j = 0; j < codeParts.length; j++) {
        // Even indices are outside <code> – unescape PascalCase there
        if (j % 2 === 0) {
          codeParts[j] = codeParts[j]
            .replace(/&#x3C;([A-Z][a-zA-Z0-9]*\s[^<]*?)>/g, (_m, content) =>
              content.includes('@') ? `<${content}>` : _m
            )
            .replace(/&#x3C;\/([A-Z][a-zA-Z0-9]*)>/g, '</$1>');
        }
      }

      parts[i] = codeParts.join('');
    }
  }

  return parts.join('');
}
