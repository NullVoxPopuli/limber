import rehypeShiki from '@shikijs/rehype';
import { stripIndent } from 'common-tags';
import { visit } from 'unist-util-visit';
import { beforeEach, describe, expect as errorExpect, it } from 'vitest';

import { resetIdCounter } from '../../utils.js';
import { parseMarkdown } from './parse.js';
import { buildCodeFenceMetaUtils } from './utils.js';

import type { Element, Root as HastRoot } from 'hast';
import type { Heading, Root as MdastRoot } from 'mdast';

const expect = errorExpect.soft;

function assertOutput(actual: string, expected: string) {
  const _actual = actual?.split('\n')?.filter(Boolean)?.join('\n')?.trim();
  const _expected = expected.split('\n').filter(Boolean).join('\n').trim();

  expect(_actual).toBe(_expected);
}

function assertCodeBlocks(
  actual: unknown,
  expected: { code: string; format: string; meta: string }[]
) {
  expect(actual).toMatchObject(expected);
}

const ALLOWED_FORMATS = ['gjs', 'jsx', 'vue', 'svelte', 'hbs'];
const defaults = {
  ...buildCodeFenceMetaUtils({
    getAllowedFormats: () => ALLOWED_FORMATS,
    getFlavorsFor: (lang) => {
      if (lang === 'jsx') {
        return ['react'];
      }

      return [];
    },
    optionsFor: () => ({}),
  }),
  ALLOWED_FORMATS,
};

beforeEach(() => {
  resetIdCounter();
});

describe('default features', () => {
  it('allows one-line-component invocation', { timeout: 10_000 }, async () => {
    const result = await parseMarkdown(`<APIDocs @package="ember-primitives" @name="Avatar" />`, {
      ...defaults,
      rehypePlugins: [[rehypeShiki, { theme: 'github-dark' }]],
    });

    expect(result.codeBlocks).toMatchInlineSnapshot(`[]`);
    expect(result.text).toMatchInlineSnapshot(
      `"<p><APIDocs @package="ember-primitives" @name="Avatar" /></p>"`
    );
  });

  it('allows multi-line-component invocation', async () => {
    const result = await parseMarkdown(
      [`<APIDocs`, `@package="ember-primitives"`, `@name="Avatar"`, `/>`].join('\n'),
      {
        ...defaults,
        rehypePlugins: [[rehypeShiki, { theme: 'github-dark' }]],
      }
    );

    expect(result.codeBlocks).toMatchInlineSnapshot(`[]`);
    expect(result.text).toMatchInlineSnapshot(`
      "<p><APIDocs
      @package="ember-primitives"
      @name="Avatar"
      /></p>"
    `);
  });

  it('allows components inside code blocks', async () => {
    const result = await parseMarkdown(
      [
        '# Hello',
        '',
        '<code>',
        '  <Shadowed @includeStyles={{true}}>',
        '     the shadow realm',
        '  </Shadowed>',
        '</code>',
      ].join('\n'),
      {
        ...defaults,
      }
    );

    expect(result.codeBlocks).toMatchInlineSnapshot(`[]`);
    expect(result.text).toMatchInlineSnapshot(`
        "<h1 id="hello">Hello</h1>
        <code>
          <Shadowed @includeStyles={{true}}>
             the shadow realm
          </Shadowed>
        </code>"
      `);
  });

  it('allows components to wrap markdown content', async () => {
    const result = await parseMarkdown(
      [
        `# Title`,
        '',
        'Text',
        '',
        '<Callout>',
        '',
        'Info [text](https://url.url)',
        '',
        '</Callout>',
        '',
      ].join('\n'),
      { ...defaults }
    );

    expect(result.codeBlocks).toMatchInlineSnapshot(`[]`);
    expect(result.text).toMatchInlineSnapshot(`
      "<h1 id="title">Title</h1>
      <p>Text</p>
      <Callout>
      <p>Info <a href="https://url.url">text</a></p>
      </Callout>"
    `);
  });

  describe('does not', () => {
    it(`mistakenly transform text in codefences (previewed text is transformed though)`, async () => {
      const result = await parseMarkdown(
        [
          '# Hello',
          '',
          '```gjs live preview',
          "import { Shadowed, PortalTargets } from 'ember-primitives';",
          '',
          '<template>',
          '  <Shadowed @includeStyles={{true}}>',
          '     the shadow realm',
          '  </Shadowed>',
          '</template>',
        ].join('\n'),
        {
          ...defaults,
        }
      );

      expect(result.codeBlocks).toMatchInlineSnapshot(`
        [
          {
            "code": "import { Shadowed, PortalTargets } from 'ember-primitives';

        <template>
          <Shadowed @includeStyles={{true}}>
             the shadow realm
          </Shadowed>
        </template>",
            "flavor": undefined,
            "format": "gjs",
            "meta": "live preview",
            "placeholderId": "repl_1",
          },
        ]
      `);
      expect(result.text).toMatchInlineSnapshot(`
        "<h1 id="hello">Hello</h1>
        <div id="repl_1" class="repl-sdk__demo"></div>
        <div class="repl-sdk__snippet" data-repl-output><pre><code class="language-gjs">import { Shadowed, PortalTargets } from 'ember-primitives';

        &#x3C;template>
          &#x3C;Shadowed @includeStyles=\\{{true}}>
             the shadow realm
          &#x3C;/Shadowed>
        &#x3C;/template>
        </code></pre></div>"
      `);
    });

    it(`mistakenly transform text in codefences`, async () => {
      const result = await parseMarkdown(
        [
          '# Hello',
          '',
          '```gjs live',
          'import { Hello } from "somewhere";',
          '',
          '<template>',
          '  <Hello />',
          '</template>',
        ].join('\n'),
        {
          ...defaults,
          rehypePlugins: [[rehypeShiki, { theme: 'github-dark' }]],
        }
      );

      expect(result.codeBlocks).toMatchInlineSnapshot(`
        [
          {
            "code": "import { Hello } from "somewhere";

        <template>
          <Hello />
        </template>",
            "flavor": undefined,
            "format": "gjs",
            "meta": "live",
            "placeholderId": "repl_1",
          },
        ]
      `);
      expect(result.text).toMatchInlineSnapshot(`
        "<h1 id="hello">Hello</h1>
        <div id="repl_1" class="repl-sdk__demo"></div>"
      `);
    });

    it('mistakenly transform a component text in backticks', async () => {
      const result = await parseMarkdown('## `<Hello @foo="two" />`', {
        ...defaults,
        rehypePlugins: [[rehypeShiki, { theme: 'github-dark' }]],
      });

      expect(result).toMatchInlineSnapshot(`
        {
          "codeBlocks": [],
          "text": "<h2 id="hello-footwo-"><code>&#x3C;Hello @foo="two" /></code></h2>",
        }
      `);
    });
  });
});

describe('heading ids', () => {
  it('treats a literal \\s in a heading as text, not as whitespace', async () => {
    // The regex in formatDefaultId used to be /\\s+/g -- a literal backslash
    // followed by `s`, rather than whitespace -- so `\s` here was replaced with
    // a space and the `s` vanished from the id.
    const result = await parseMarkdown(`## a \\s b`, { ...defaults });

    expect(result.text).toContain('id="a-s-b"');
  });
});

describe('options', () => {
  describe('headingId', () => {
    it('matches the anchor GitHub generates', async () => {
      const result = await parseMarkdown(`## setupMirage`, { ...defaults });

      expect(result.text).toBe('<h2 id="setupmirage">setupMirage</h2>');
    });

    it('keeps a colon out of the id, the way GitHub does', async () => {
      const result = await parseMarkdown(`## V2 JSON:API`, { ...defaults });

      expect(result.text).toBe('<h2 id="v2-jsonapi">V2 JSON:API</h2>');
    });

    it('de-duplicates repeated headings within a document', async () => {
      const result = await parseMarkdown(`## Usage\n\n## Usage\n\n## Usage`, { ...defaults });

      expect(result.text).toContain('id="usage"');
      expect(result.text).toContain('id="usage-1"');
      expect(result.text).toContain('id="usage-2"');
    });

    it('restarts numbering for each document', async () => {
      await parseMarkdown(`## Usage`, { ...defaults });

      const second = await parseMarkdown(`## Usage`, { ...defaults });

      expect(second.text).toBe('<h2 id="usage">Usage</h2>');
    });

    it("inserts nothing between a heading's children", async () => {
      // Verified against rehype-slug, which is the github-slugger reference:
      // `## Hello *there*` -> id="hello-there". Joining the children with a
      // space instead would add one the markdown never had -> `hello--there`.
      const result = await parseMarkdown(`## Hello *there*`, { ...defaults });

      expect(result.text).toContain('id="hello-there"');
    });

    it('keeps whitespace-only text nodes between formatted children', async () => {
      // The space between the emphases is its own text node. Dropping it
      // would slug `ab`; GitHub slugs `a-b`.
      const result = await parseMarkdown(`## *a* *b*`, { ...defaults });

      expect(result.text).toContain('id="a-b"');
    });

    it('keeps whitespace the author actually wrote, like GitHub does', async () => {
      // github-slugger does not collapse runs; rehype-slug gives
      // id="hello----world" for this input, so matching it means not collapsing.
      const result = await parseMarkdown(`##   Hello    World  `, { ...defaults });

      expect(result.text).toContain('id="hello----world"');
    });

    it('leaves an explicit {#custom-id} heading alone', async () => {
      const result = await parseMarkdown(`## Title {#custom}`, { ...defaults });

      expect(result.text).not.toContain('id="title"');
    });
  });

  describe('remarkPlugins', () => {
    it('works', async () => {
      const result = await parseMarkdown(`# Title`, {
        ...defaults,
        remarkPlugins: [
          function noH1() {
            return (tree: MdastRoot) => {
              visit(tree, 'heading', function (node: Heading) {
                if (node.depth === 1) {
                  node.depth = 2;
                }
              });
            };
          },
        ],
      });

      expect(result.text).toBe('<h2 id="title">Title</h2>');
      expect(result.codeBlocks).to.deep.equal([]);
    });

    it('w/ options', async () => {
      const result = await parseMarkdown(`# Title`, {
        ...defaults,
        remarkPlugins: [
          [
            function noH1(options: { depth: 1 | 2 | 3 | 4 | 5 | 6 }) {
              return (tree: MdastRoot) => {
                visit(tree, 'heading', function (node: Heading) {
                  if (node.depth === 1) {
                    node.depth = options.depth;
                  }
                });
              };
            },
            { depth: 3 },
          ],
        ],
      });

      expect(result.text).toBe('<h3 id="title">Title</h3>');
      expect(result.codeBlocks).to.deep.equal([]);
    });
  });

  describe('rehypePlugins', () => {
    it('works', async () => {
      const result = await parseMarkdown(`# Title`, {
        ...defaults,
        rehypePlugins: [
          function noH1() {
            return (tree: HastRoot) => {
              visit(tree, 'element', function (node: Element) {
                if (node.tagName === 'h1') {
                  node.tagName = 'h2';
                }
              });
            };
          },
        ],
      });

      expect(result.text).toBe('<h2 id="title">Title</h2>');
      expect(result.codeBlocks).to.deep.equal([]);
    });

    it('w/ options', async () => {
      const result = await parseMarkdown(`# Title`, {
        ...defaults,
        rehypePlugins: [
          [
            function noH1(options: { depth: 1 | 2 | 3 | 4 | 5 | 6 }) {
              return (tree: HastRoot) => {
                visit(tree, 'element', function (node: Element) {
                  if (node.tagName === 'h1') {
                    node.tagName = `h${options.depth ?? 2}`;
                  }
                });
              };
            },
            { depth: 3 },
          ],
        ],
      });

      expect(result.text).toBe('<h3 id="title">Title</h3>');
      expect(result.codeBlocks).to.deep.equal([]);
    });

    it('retains {{ }} escaping', async () => {
      const result = await parseMarkdown(
        stripIndent`
        # Title

        \`\`\`gjs
        const two = 2

        <template>
          {{two}}
        </template>
        \`\`\`
      `,
        {
          ...defaults,
          rehypePlugins: [[rehypeShiki, { theme: 'github-dark' }]],
        }
      );

      assertOutput(
        result.text,
        `<h1 id="title">Title</h1>
<div class="repl-sdk__snippet" data-repl-output><pre class="shiki github-dark" style="background-color:#24292e;color:#e1e4e8" tabindex="0"><code><span class="line"><span style="color:#F97583">const</span><span style="color:#79B8FF"> two</span><span style="color:#F97583"> =</span><span style="color:#79B8FF"> 2</span></span>
<span class="line"></span>
<span class="line"><span style="color:#E1E4E8">&#x3C;</span><span style="color:#85E89D">template</span><span style="color:#E1E4E8">></span></span>
<span class="line"><span style="color:#F97583">  \\{{</span><span style="color:#79B8FF">two</span><span style="color:#F97583">}}</span></span>
<span class="line"><span style="color:#E1E4E8">&#x3C;/</span><span style="color:#85E89D">template</span><span style="color:#E1E4E8">></span></span></code></pre></div>`
      );
    });
  });

  describe('codefences', () => {
    describe('hbs', () => {
      it('Code fence is live', async () => {
        const snippet = `{{concat "hello" " " "there"}}`;
        const result = await parseMarkdown(
          stripIndent`
          # Title

          \`\`\`hbs live
            ${snippet}
          \`\`\`
        `.trim(),
          { ...defaults }
        );

        expect(result.text).toMatchInlineSnapshot(`
          "<h1 id="title">Title</h1>
          <div id="repl_1" class="repl-sdk__demo"></div>"
        `);

        assertCodeBlocks(result.codeBlocks, [
          {
            code: snippet,
            format: 'hbs',
            meta: 'live',
          },
        ]);
      });
    });

    describe('gjs', () => {
      it('Code fence does not have the "live" keyword', async function () {
        const result = await parseMarkdown(
          stripIndent`
        # Title

        \`\`\`gjs
          const two = 2;
        \`\`\`
      `,
          { ...defaults }
        );

        assertOutput(
          result.text,
          stripIndent`
          <h1 id="title">Title</h1>

          <div class=\"repl-sdk__snippet\" data-repl-output><pre><code class=\"language-gjs\">  const two = 2;
          </code></pre></div>
        `
        );

        expect(result.codeBlocks).to.deep.equal([]);
      });

      it('Code fence is live', async function () {
        const snippet = `const two = 2`;
        const result = await parseMarkdown(
          stripIndent`
        # Title

        \`\`\`gjs live
          ${snippet}
        \`\`\`
      `,
          { ...defaults }
        );

        expect(result.text).toMatchInlineSnapshot(`
          "<h1 id="title">Title</h1>
          <div id="repl_1" class="repl-sdk__demo"></div>"
        `);

        assertCodeBlocks(result.codeBlocks, [
          {
            code: snippet,
            format: 'gjs',
            meta: 'live',
          },
        ]);
      });

      it('Code with preview fence has {{ }} tokens escaped', async function () {
        const result = await parseMarkdown(
          stripIndent`
        # Title

        \`\`\`gjs
        const two = 2

        <template>
          {{two}}
        </template>
        \`\`\`
      `,
          { ...defaults }
        );

        assertOutput(
          result.text,
          stripIndent`
          <h1 id="title">Title</h1>

          <div class=\"repl-sdk__snippet\" data-repl-output><pre><code class=\"language-gjs\">const two = 2

          &#x3C;template>
            \\{{two}}
          &#x3C;/template>
          </code></pre></div>
        `
        );
      });

      it('Inline Code with {{ }} tokens is escaped', async function () {
        const result = await parseMarkdown(
          stripIndent`
        # Title

        \`{{ foo }}\`
      `,
          { ...defaults }
        );

        assertOutput(
          result.text,
          stripIndent`
          <h1 id="title">Title</h1>
          <p><code>\\{{ foo }}</code></p>
        `
        );
      });

      it('Can invoke a component again when defined in a live fence', async function () {
        const snippet = `const two = 2`;
        const result = await parseMarkdown(
          stripIndent`
      # Title

      \`\`\`gjs live
        ${snippet}
      \`\`\`
      <Demo />
    `,
          { ...defaults }
        );

        expect(result.text).toMatchInlineSnapshot(`
          "<h1 id="title">Title</h1>
          <div id="repl_1" class="repl-sdk__demo"></div>
          <Demo />"
        `);

        assertCodeBlocks(result.codeBlocks, [
          {
            code: snippet,
            format: 'gjs',
            meta: 'live',
          },
        ]);
      });

      it('Code fence imports things', async function () {
        const snippet = stripIndent`
        import Component from '@glimmer/component';
        import { on } from '@ember/modifier';

        <template>
          <button {{on "click" console.log}}>Click</button>
        </template>
      `;
        const result = await parseMarkdown(
          `hi\n` + `\n` + '```gjs live preview\n' + snippet + '\n```',
          { ...defaults }
        );

        expect(result.text).toMatchInlineSnapshot(`
          "<p>hi</p>
          <div id="repl_1" class="repl-sdk__demo"></div>
          <div class="repl-sdk__snippet" data-repl-output><pre><code class="language-gjs">import Component from '@glimmer/component';
          import { on } from '@ember/modifier';

          &#x3C;template>
            &#x3C;button \\{{on "click" console.log}}>Click&#x3C;/button>
          &#x3C;/template>
          </code></pre></div>"
        `);

        assertCodeBlocks(result.codeBlocks, [
          {
            code: snippet,
            format: 'gjs',
            meta: 'live preview',
          },
        ]);
      });
    });
  });
});
