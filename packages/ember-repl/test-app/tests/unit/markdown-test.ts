import { module, test } from 'qunit';

import rehypeShiki from '@shikijs/rehype';
import { stripIndent } from 'common-tags';
import { invocationOf, nameFor } from 'ember-repl';
import { parseMarkdown } from 'ember-repl/formats/markdown';
import { visit } from 'unist-util-visit';

/**
 * NOTE: there is a problem(?) with remark-hbs where all extra newlines and
 *       indentation are stripped
 */
function assertOutput(actual: string, expected: string) {
  let _actual = actual.split('\n').filter(Boolean).join('\n').trim();
  let _expected = expected.split('\n').filter(Boolean).join('\n').trim();

  QUnit.assert.equal(_actual, _expected);
}

module('Unit | parseMarkdown()', function () {
  test('There are no code fences', async function (assert) {
    let result = await parseMarkdown(stripIndent`
      # Title

      text
    `);

    assertOutput(
      result.templateOnlyGlimdown,
      stripIndent`
        <h1>Title</h1>

        <p>text</p>
      `
    );

    assert.deepEqual(result.blocks, []);
  });

  test('There is code fence, but it is not gjs', async function (assert) {
    let result = await parseMarkdown(
      stripIndent`
      # Title

      \`\`\`js
        const two = 2;
      \`\`\`
    `,
      { CopyComponent: '<CopyMenu />' }
    );

    assertOutput(
      result.templateOnlyGlimdown,
      stripIndent`
        <h1>Title</h1>

        <div class=\"glimdown-snippet relative\"><pre><code class=\"language-js\">  const two = 2;
        </code></pre><CopyMenu /></div>
      `
    );

    assert.deepEqual(result.blocks, []);
  });

  module('plugin options', function () {
    test('remarkPlugins', async function (assert) {
      let result = await parseMarkdown(`# Title`, {
        remarkPlugins: [
          function noH1(/* options */) {
            return (tree) => {
              return visit(tree, ['heading'], function (node) {
                if (!('depth' in node)) return;

                if (node.depth === 1) {
                  node.depth = 2;
                }

                return 'skip';
              });
            };
          },
        ],
      });

      assertOutput(
        result.templateOnlyGlimdown,
        stripIndent`
        <h2>Title</h2>
      `
      );

      assert.deepEqual(result.blocks, []);
    });

    test('remarkPlugins w/ options', async function (assert) {
      let result = await parseMarkdown(`# Title`, {
        remarkPlugins: [
          [
            function noH1(options: { depth: number }) {
              return (tree) => {
                return visit(tree, ['heading'], function (node) {
                  if (!('depth' in node)) return;

                  if (node.depth === 1) {
                    node.depth = options.depth;
                  }

                  return 'skip';
                });
              };
            },
            { depth: 3 },
          ],
        ],
      });

      assertOutput(result.templateOnlyGlimdown, `<h3>Title</h3>`);

      assert.deepEqual(result.blocks, []);
    });
    test('rehypePlugins', async function (assert) {
      let result = await parseMarkdown(`# Title`, {
        rehypePlugins: [
          function noH1(/* options */) {
            return (tree) => {
              return visit(tree, ['element'], function (node) {
                if (!('tagName' in node)) return;

                if (node.tagName === 'h1') {
                  node.tagName = 'h2';
                }

                return 'skip';
              });
            };
          },
        ],
      });

      assertOutput(
        result.templateOnlyGlimdown,
        stripIndent`
        <h2>Title</h2>
      `
      );

      assert.deepEqual(result.blocks, []);
    });

    test('rehypePlugins w/ options', async function (assert) {
      let result = await parseMarkdown(`# Title`, {
        rehypePlugins: [
          [
            function noH1(options: { depth: number }) {
              return (tree) => {
                return visit(tree, ['element'], function (node) {
                  if (!('tagName' in node)) return;

                  if (node.tagName === 'h1') {
                    node.tagName = `h${options.depth ?? 2}`;
                  }

                  return 'skip';
                });
              };
            },
            { depth: 3 },
          ],
        ],
      });

      assertOutput(result.templateOnlyGlimdown, `<h3>Title</h3>`);

      assert.deepEqual(result.blocks, []);
    });

    test('rehypePlugins retain {{ }} escaping', async function () {
      let result = await parseMarkdown(
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
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          rehypePlugins: [[rehypeShiki as any, { theme: 'github-dark' }]],
        }
      );

      assertOutput(
        result.templateOnlyGlimdown,
        `<h1>Title</h1>
<div class="glimdown-snippet relative"><pre class="shiki github-dark" style="background-color:#24292e;color:#e1e4e8" tabindex="0"><code><span class="line"><span style="color:#F97583">const</span><span style="color:#79B8FF"> two</span><span style="color:#F97583"> =</span><span style="color:#79B8FF"> 2</span></span>
<span class="line"></span>
<span class="line"><span style="color:#E1E4E8">&#x3C;</span><span style="color:#85E89D">template</span><span style="color:#E1E4E8">></span></span>
<span class="line"><span style="color:#F97583">  \\{{</span><span style="color:#79B8FF">two</span><span style="color:#F97583">}}</span></span>
<span class="line"><span style="color:#E1E4E8">&#x3C;/</span><span style="color:#85E89D">template</span><span style="color:#E1E4E8">></span></span></code></pre></div>`
      );
    });
  });

  module('hbs', function () {
    test('Codecontainer fence is live', async function (assert) {
      let snippet = `{{concat "hello" " " "there"}}`;
      let name = nameFor(snippet);
      let result = await parseMarkdown(
        stripIndent`
          # Title

          \`\`\`hbs live
            ${snippet}
          \`\`\`
        `.trim()
      );

      assertOutput(
        result.templateOnlyGlimdown,
        stripIndent`
          <h1>Title</h1>

          <div class=\"glimdown-render\">${invocationOf(name)}</div>
        `
      );

      assert.deepEqual(result.blocks, [
        {
          code: snippet,
          name,
          lang: 'hbs',
        },
      ]);
    });
  });

  module('gjs', function () {
    test('Code fence does not have the "live" keyword', async function (assert) {
      let result = await parseMarkdown(
        stripIndent`
        # Title

        \`\`\`gjs
          const two = 2;
        \`\`\`
      `,
        { CopyComponent: '<CopyMenu />' }
      );

      assertOutput(
        result.templateOnlyGlimdown,
        stripIndent`
          <h1>Title</h1>

          <div class=\"glimdown-snippet relative\"><pre><code class=\"language-gjs\">  const two = 2;
          </code></pre><CopyMenu /></div>
        `
      );

      assert.deepEqual(result.blocks, []);
    });

    test('Code fence is live', async function (assert) {
      let snippet = `const two = 2`;
      let name = nameFor(snippet);
      let result = await parseMarkdown(stripIndent`
        # Title

        \`\`\`gjs live
          ${snippet}
        \`\`\`
      `);

      assertOutput(
        result.templateOnlyGlimdown,
        stripIndent`
          <h1>Title</h1>

          <div class=\"glimdown-render\">${invocationOf(name)}</div>
        `
      );

      assert.deepEqual(result.blocks, [
        {
          code: snippet,
          name,
          lang: 'gjs',
        },
      ]);
    });

    test('Code with preview fence has {{ }} tokens escaped', async function () {
      let result = await parseMarkdown(stripIndent`
        # Title

        \`\`\`gjs
        const two = 2

        <template>
          {{two}}
        </template>
        \`\`\`
      `);

      assertOutput(
        result.templateOnlyGlimdown,
        stripIndent`
          <h1>Title</h1>

          <div class=\"glimdown-snippet relative\"><pre><code class=\"language-gjs\">const two = 2

          &#x3C;template>
            \\{{two}}
          &#x3C;/template>
          </code></pre></div>
        `
      );
    });

    test('Inline Code with {{ }} tokens is escaped', async function () {
      let result = await parseMarkdown(stripIndent`
        # Title

        \`{{ foo }}\`
      `);

      assertOutput(
        result.templateOnlyGlimdown,
        stripIndent`
          <h1>Title</h1>
          <p><code>\\{{ foo }}</code></p>
        `
      );
    });

    test('Can invoke a component again when defined in a live fence', async function (assert) {
      let snippet = `const two = 2`;
      let name = nameFor(snippet);
      let result = await parseMarkdown(stripIndent`
      # Title

      \`\`\`gjs live
        ${snippet}
      \`\`\`
      <Demo />
    `);

      assertOutput(
        result.templateOnlyGlimdown,
        stripIndent`
          <h1>Title</h1>

          <div class=\"glimdown-render\">${invocationOf(name)}</div>
          <Demo />
        `
      );

      assert.deepEqual(result.blocks, [
        {
          code: snippet,
          name,
          lang: 'gjs',
        },
      ]);
    });

    test('Code fence imports things', async function (assert) {
      let snippet = stripIndent`
        import Component from '@glimmer/component';
        import { on } from '@ember/modifier';

        <template>
          <button {{on "click" console.log}}>Click</button>
        </template>
      `;
      let name = nameFor(snippet);
      let result = await parseMarkdown(
        `hi\n` + `\n` + '```gjs live preview\n' + snippet + '\n```',
        { CopyComponent: '<CopyMenu />' }
      );

      assertOutput(
        result.templateOnlyGlimdown,
        stripIndent`
          <p>hi</p>

          <div class=\"glimdown-render\">${invocationOf(name)}</div>
          <div class=\"glimdown-snippet relative\"><pre><code class=\"language-gjs\">import Component from '@glimmer/component';
          import { on } from '@ember/modifier';
          &#x3C;template>
            &#x3C;button \\{{on \"click\" console.log}}>Click&#x3C;/button>
          &#x3C;/template>
          </code></pre><CopyMenu /></div>
        `
      );

      assert.deepEqual(result.blocks, [
        {
          code: snippet,
          name,
          lang: 'gjs',
        },
      ]);
    });
  });
});
