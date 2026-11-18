import type { InternalOptions } from './types';

export function parseMarkdown(
  input: string,
  options: InternalOptions
): Promise<{
  text: string;
  codeBlocks: Array<{
    format: string;
    flavor: string | undefined;
    code: string;
    /**
     * The id of the element in `text` where this block renders.
     */
    placeholderId: string;
    /**
     * The text after the language on the fence line.
     */
    meta: string | null | undefined;
  }>;
}>;
