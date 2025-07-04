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
  let markdownCompiler = buildCompiler(options);
  let processed = await markdownCompiler.process(input);
  let liveCode = /** @type {{ lang: string; format: string; code: string; name: string }[]} */ (
    processed.data.liveCode || []
  );
  // @ts-ignore - processed is typed as unknown due to unified processor complexity
  let templateOnly = processed.toString();

  return { text: templateOnly, codeBlocks: liveCode };
}
