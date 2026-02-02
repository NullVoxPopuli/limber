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

import { buildCompiler } from './build-compiler.js';

export { buildCompiler } from './build-compiler.js';

/**
 * @param {string} input
 * @param {import('./types').InternalOptions} options
 * @returns {Promise<ParseResult>}
 */
export async function parseMarkdown(input, options) {
  const markdownCompiler = options?.compiler ?? buildCompiler(options);
  const processed = await markdownCompiler.process(input);
  const liveCode = /** @type {CodeBlock[]} */ (processed.data.liveCode || []);
  // @ts-ignore - processed is typed as unknown due to unified processor complexity
  let templateOnly = processed.toString();

  // Unescape PascalCase components that had only the opening < HTML-entity escaped
  // BUT only outside of <pre><code> blocks where escaping should be preserved
  // (inline <code> tags should have components unescaped)
  // Split by <pre><code>...</code></pre> to exclude only code blocks
  const parts = templateOnly.split(/(<pre[^>]*>.*?<\/pre>)/is);

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];

    // Only process parts that are NOT pre blocks (odd indices are pre blocks)
    if (i % 2 === 0 && part) {
      // Pattern: &#x3C;ComponentName ... / > (only < is escaped as &#x3C;)
      parts[i] = part.replace(/&#x3C;([A-Z][a-zA-Z0-9]*\s[^<]*?)>/g, (match, content) => {
        // Only unescape if it contains @ (attribute) indicating a component
        if (content.includes('@')) {
          return `<${content}>`;
        }

        return match;
      });
    }
  }

  templateOnly = parts.join('');

  return { text: templateOnly, codeBlocks: liveCode };
}
