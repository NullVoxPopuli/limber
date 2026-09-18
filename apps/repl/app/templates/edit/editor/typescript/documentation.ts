import type { Compiler } from 'repl-sdk';

/**
 * The Markdown in hover, completion, and signature documentation,
 * rendered by the REPL's own `md` compiler: the same remark and rehype
 * plugins as an md document, Shiki for the code blocks included.
 *
 * The compile writes the text as a file under its own name,
 * so a compile of the document is not disturbed.
 */
export function documentationRenderer(compiler: Compiler) {
  return async (markdown: string): Promise<string> => {
    const { element, destroy } = await compiler.compile('md', markdown, {
      fileName: 'documentation.md',
    });

    try {
      return element.innerHTML;
    } finally {
      destroy();
    }
  };
}
