/**
 * @typedef {import('unified').Plugin} UPlugin
 */
import { buildCompiler } from './build-compiler.js';

/**
 * @param {string} input
 * @param {import('./types').InternalOptions} options
 *
 * @returns {Promise<{ text: string; codeBlocks: { lang: string; format: string; code: string; name: string }[] }>}
 */
export async function parseMarkdown(input, options) {
  const markdownCompiler = buildCompiler(options);
  const processed = await markdownCompiler.process(input);
  const liveCode = /** @type {{ lang: string; format: string; code: string; name: string }[]} */ (
    processed.data.liveCode || []
  );
  // @ts-ignore - processed is typed as unknown due to unified processor complexity
  let templateOnly = processed.toString();

  // Unescape PascalCase components that had only the opening < HTML-entity escaped
  // BUT only outside of <pre><code> blocks where escaping should be preserved
  // (inline <code> tags should have components unescaped)
  // Split by <pre><code>...</code></pre> to exclude only code blocks
  const parts = templateOnly.split(/(<pre[^>]*>.*?<\/pre>)/is);

  for (let i = 0; i < parts.length; i++) {
    // Only process parts that are NOT pre blocks (odd indices are pre blocks)
    if (i % 2 === 0) {
      // Pattern: &#x3C;ComponentName ... / > (only < is escaped as &#x3C;)
      parts[i] = parts[i].replace(/&#x3C;([A-Z][a-zA-Z0-9]*\s[^<]*?)>/g, (match, content) => {
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
