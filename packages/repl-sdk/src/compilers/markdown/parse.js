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
  const templateOnly = processed.toString();

  return { text: templateOnly, codeBlocks: liveCode };
}
