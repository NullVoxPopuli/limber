import rehypeStringify from 'rehype-stringify';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import { unified } from 'unified';

import { rehypeShikiWorker } from '#hl/rehype.ts';

/**
 * The Markdown in hover, completion, and signature documentation,
 * rendered the way the REPL renders a document: the same remark and
 * rehype, and the same Shiki in its worker for the code blocks.
 *
 * Raw HTML in the Markdown is dropped. The text comes from the type
 * declarations of packages, which nobody here reviewed.
 */
const processor = unified()
  .use(remarkParse)
  .use(remarkRehype)
  .use(rehypeShikiWorker)
  .use(rehypeStringify);

export async function renderDocumentation(markdown: string): Promise<string> {
  const file = await processor.process(markdown);

  return String(file);
}
