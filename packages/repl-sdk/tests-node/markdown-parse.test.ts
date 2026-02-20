import { parseMarkdown } from 'repl-sdk/markdown/parse';
import { describe, expect, test } from 'vitest';

describe('markdown/parse', () => {
  test('it works', async () => {
    const result = await parseMarkdown(`# hello`, {});

    expect(result.text).toMatchInlineSnapshot(`"<h1 id="hello">hello</h1>"`);
    expect(result.codeBlocks).toMatchInlineSnapshot(`[]`);
  });

  test('it escapes component invocations in code blocks', async () => {
    const result = await parseMarkdown(
      `# Comp in tag

comp: \`<Portal @to="popover">\` 

tag: \`<div>\`

## Install

\`\`\`hbs live
<SetupInstructions @src="components/portal-targets.gts" />
\`\`\`
`,
      {
        isLive: (meta) => meta.includes('live'),
        ALLOWED_FORMATS: ['hbs'],
        getFlavorFromMeta: () => undefined,
        isPreview: () => false,
        isBelow: () => false,
      }
    );

    expect(result.text).toMatchInlineSnapshot(`
      "<h1 id="comp-in-tag">Comp in tag</h1>
      <p>comp: <code>&#x3C;Portal @to="popover"></code></p>
      <p>tag: <code>&#x3C;div></code></p>
      <h2 id="install">Install</h2>
      <div id="repl_1" class="repl-sdk__demo"></div>"
    `);
    expect(result.codeBlocks).toMatchInlineSnapshot(`
      [
        {
          "code": "<SetupInstructions @src="components/portal-targets.gts" />",
          "flavor": undefined,
          "format": "hbs",
          "meta": "live",
          "placeholderId": "repl_1",
        },
      ]
    `);
  });
});
