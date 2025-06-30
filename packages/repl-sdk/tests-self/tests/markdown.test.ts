import type { Root } from 'mdast';
import { Compiler } from 'repl-sdk';
import { stripIndent } from 'common-tags';
import { describe, expect, test, beforeEach } from 'vitest';
import { allKnownModules, markdownModules, vueModules } from './setup.ts';
import type { Plugin } from 'unified';
import { visit } from 'unist-util-visit';

function escapeFence(code: string) {
  return code.replace(/`/g, '\\`');
}

function fenced(code: string, meta: string) {
  return '```' + meta + '\n' + escapeFence(code) + '\n```';
}

beforeEach(() => {
  delete (window as any)[Symbol.for('__repl-sdk__compiler__')];
});

describe('markdown', () => {
  test('it works', async () => {
    const compiler = new Compiler({ resolve: allKnownModules });
    const element = await compiler.compile('md', `# Hello`);

    const h1 = element.querySelector('h1');

    expect(h1).toBeTruthy();
    expect(h1?.textContent).toContain('Hello');
  });

  describe('code fences', () => {
    const vue = `
      <style scoped>
        h2 { color: red; }
      </style>
      <script setup>
        import { ref } from 'vue'

        const count = ref(0)
      </script>
      <template>
        <h2>GENERAL KENOBI!</h2>

        {{count}}
      </template>
    `;

    const jsxReact = `
      import React from 'react';

      export default <>
        <h1>Hello World</h1>

        GENERAL KENOBI!
      </>;
    `;

    const svelte = `
      <script>
        let name = 'world';
      </script>
      <style>
        h1 { color: red; }
      </style>

      <h1>Hello {name}!</h1>
      `;

    const mermaid = `
graph TD;
  A-->B;
  A-->C;
  B-->D;
  C-->D;
`;

    test('vue live', async () => {
      const compiler = new Compiler({
        resolve: {
          ...markdownModules,
          ...vueModules,
        },
      });
      const element = await compiler.compile('md', `# Hello\n\n` + fenced(vue, 'vue live'));

      const h1 = element.querySelector('h1');
      const h2 = element.querySelector('h2');

      // getComputedStyle doesn't work without the element existing in the document
      document.body.appendChild(element);

      expect(h1).toBeTruthy();
      expect(h2).toBeTruthy();
      expect(h1?.textContent).toContain('Hello');
      expect(h2?.textContent).toContain('GENERAL KENOBI!');
      expect(window.getComputedStyle(h2!).color).toBe('rgb(255, 0, 0)');
    });

    test('jsx requires a flavor to be specified', async () => {
      const compiler = new Compiler({ resolve: allKnownModules });

      await expect(
        compiler.compile(
          'md',
          `# Hello\n\n` +
            fenced(jsxReact, 'jsx react live') +
            '\n\n' +
            fenced(`export default <>hi</>`, 'jsx live')
        )
      ).rejects.toThrow('make sure you specify the flavor.');
    });

    test('svelte live', async () => {
      const compiler = new Compiler({ resolve: allKnownModules });
      const element = await compiler.compile('md', fenced(svelte, 'svelte live'));

      const h1 = element.querySelector('h1');

      // getComputedStyle doesn't work without the element existing in the document
      document.body.appendChild(element);

      expect(h1).toBeTruthy();
      expect(h1?.textContent).toContain('Hello');
      expect(window.getComputedStyle(h1!).color).toBe('rgb(255, 0, 0)');
    });

    test('mermaid (no live)', async () => {
      const compiler = new Compiler({ resolve: markdownModules });
      const element = await compiler.compile('md', fenced(mermaid, 'mermaid'));

      const rootSVG = element.querySelector('svg');

      expect(rootSVG, 'Mermaid draws in SVG inside the <pre> tag').toBeTruthy();
    });

    test('unknown', async () => {
      const compiler = new Compiler({ resolve: allKnownModules });
      const element = await compiler.compile('md', fenced('hello', 'unknown-ext'));

      expect(element.innerHTML).toMatchInlineSnapshot(`
        "<div class="repl-sdk__snippet" data-repl-output=""><pre><code class="language-unknown-ext">hello
        </code></pre></div>"
      `);
    });
  });

  describe('markdown features', () => {
    test('tables', async () => {
      const compiler = new Compiler({ resolve: allKnownModules });
      const snippet = stripIndent`
        | Color | Food |
        | ----  | ---- |
        | red   | apple |
        | yellow| banana |
      `;

      const element = await compiler.compile('md', snippet);

      expect(element.querySelector('table')).toBeTruthy();
      expect(element.querySelector('td')?.textContent).toContain('red');
    });

    test('footnotes', async () => {
      const compiler = new Compiler({ resolve: allKnownModules });
      const snippet = stripIndent`
        text[^note]

        [^note]: a note about a thing
      `;

      const element = await compiler.compile('md', snippet);

      expect(element.querySelector('sup')).toBeTruthy();
      expect(element.querySelectorAll('a').length).toBe(2);
    });
  });

  describe('remark plugins', () => {
    test('adding a remark plugin', () => {});

    describe('remove <pre>', () => {
      const snippet = stripIndent`
        text

        \`\`\`js
        const two = 2;
        \`\`\`
      `;

      /**
       * Test plugin that just turns code into an
       * unformatted mess in a p tag
       */
      const removePre: Plugin<[], Root> = (/* options */) => {
        return function transformer(tree) {
          visit(tree, ['code'], function (node, index, parent) {
            if (!parent) return;
            if (undefined === index) return;

            parent.children[index] = {
              type: 'html',
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              value: `<p>${node.value}</p>`,
            };
          });
        };
      };

      test('without the plugin', async () => {
        const compiler = new Compiler({ resolve: allKnownModules });
        const element = await compiler.compile('md', snippet);

        expect(element.querySelector('code')).toBeTruthy();
      });

      test('with the plugin (global)', async () => {
        const compiler = new Compiler({
          resolve: allKnownModules,
          options: { md: { remarkPlugins: [removePre] } },
        });
        const element = await compiler.compile('md', snippet);

        expect(element.querySelector('code')).not.toBeTruthy();
      });

      test('with the plugin (compile)', async () => {
        const compiler = new Compiler({ resolve: allKnownModules });
        const element = await compiler.compile('md', snippet, {
          remarkPlugins: [removePre],
        });

        expect(element.querySelector('code')).not.toBeTruthy();
      });
    });

    describe('remark plugins can change the output', () => {
      const snippet = stripIndent`
        # Hello

        \`\`\`gjs
        <template>not a greeting</template>
        \`\`\`

        <Greeting />
      `;

      const codeSwapper: Plugin<[], Root> = (/* options */) => {
        return (tree) => {
          tree.children = tree.children.map((child) => {
            if (child.type === 'code') {
              return {
                type: 'code',
                lang: 'gjs',
                value: `
                  <template>a greeting</template>
                `,
              };
            }
            return child;
          });
        };
      };

      test('without the plugin', async () => {
        const compiler = new Compiler({
          resolve: allKnownModules,
          options: { md: { remarkPlugins: [] } },
        });
        const element = await compiler.compile('md', snippet);

        expect(element.querySelector('code')?.textContent).includes('not a greeting');
      });

      test('with the plugin', async () => {
        const compiler = new Compiler({
          resolve: allKnownModules,
          options: { md: { remarkPlugins: [codeSwapper] } },
        });
        const element = await compiler.compile('md', snippet);
        const text = element.querySelector('code')?.textContent;

        expect(text).not.includes('not a greeting');
        expect(text).includes('a greeting');
      });
    });
  });

  describe('rehype plugins', () => {
    describe('downgrade h1 to h2', () => {
      const snippet = '# Hello';
      const noH1: Plugin<[], Root> = (/* options */) => {
        return (tree) => {
          return visit(tree, ['element'], function (node) {
            if (!('tagName' in node)) return;

            if (node.tagName === 'h1') {
              node.tagName = 'h2';
            }

            return 'skip';
          });
        };
      };

      test('without the plugin', async () => {
        const compiler = new Compiler({
          resolve: allKnownModules,
          options: { md: { rehypePlugins: [] } },
        });
        const element = await compiler.compile('md', snippet);
        const text = element.innerHTML;

        expect(text).not.includes('h2');
        expect(text).includes('h1');
      });

      test('with the plugin (global)', async () => {
        const compiler = new Compiler({
          resolve: allKnownModules,
          options: { md: { rehypePlugins: [noH1] } },
        });
        const element = await compiler.compile('md', snippet);
        const text = element.innerHTML;

        expect(text).not.includes('h1');
        expect(text).includes('h2');
      });

      test('with the plugin (compile)', async () => {
        const compiler = new Compiler({
          resolve: allKnownModules,
          options: { md: { rehypePlugins: [noH1] } },
        });
        const element = await compiler.compile('md', snippet);
        const text = element.innerHTML;

        expect(text).not.includes('h1');
        expect(text).includes('h2');
      });
    });
  });
});
