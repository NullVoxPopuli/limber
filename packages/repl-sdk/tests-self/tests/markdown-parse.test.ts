import { describe, test, expect } from 'vitest';
import { parseMarkdown } from 'repl-sdk/markdown/parse';

describe('markdown/parse', () => {
  test('it works', async () => {
    const result = await parseMarkdown(`# hello`, {});

    expect(result.text).toMatchInlineSnapshot(`"<h1 id="hello">hello</h1>"`);
    expect(result.codeBlocks).toMatchInlineSnapshot(`[]`);
  });
});
