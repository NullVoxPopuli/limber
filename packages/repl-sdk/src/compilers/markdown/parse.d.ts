import type { InternalOptions } from './types';

/**
 * One live code fence's worth of information collected during the parse pass.
 * Mirrors what `liveCodeExtraction` pushes onto `file.data.liveCode`.
 */
export interface LiveCodeBlock {
  /** Language id from the code fence (e.g. `gjs`, `hbs`, `python`). */
  format: string;
  /** Optional flavor parsed from the meta (e.g. `ember`, `react`). */
  flavor: string | undefined;
  /** The fence body, trimmed. */
  code: string;
  /** Stable id used by the placeholder `<div id="…">` in the rendered HTML. */
  placeholderId: string;
  /** Raw meta string from the fence. */
  meta: string | undefined;
}

export function parseMarkdown(
  input: string,
  options: InternalOptions
): Promise<{
  text: string;
  codeBlocks: LiveCodeBlock[];
}>;

export function buildCompiler(options: InternalOptions): unknown;
