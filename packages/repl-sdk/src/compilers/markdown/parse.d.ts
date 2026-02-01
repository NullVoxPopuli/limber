import type { InternalOptions } from './types';

export function parseMarkdown(
  input: string,
  options: InternalOptions
): Promise<{
  text: string;
  codeBlocks: Array<{
    lang: string;
    format: string;
    code: string;
    name: string;
  }>;
}>;
