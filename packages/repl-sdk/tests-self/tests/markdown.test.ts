import { Compiler } from 'repl-sdk';
import { stripIndent } from 'common-tags';
import { describe, expect, test, beforeEach } from 'vitest';
import { allKnownModules, markdownModules, vueModules } from './setup.ts';

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
      const compiler = new Compiler({ resolve: {
      ...markdownModules,
      ...vueModules,
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

      expect(
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

      expect(element.innerHTML).toMatchInlineSnapshot();
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

    describe('remark plugins', () => {
      test('adding a remark plugin', () => {});

      test('demo: remove pre code', () => {});

      test('baseline: without the plugin, pre renders', () => {});

      test('with the plugin: no pre renders', () => {});

      test('can add code snippets', () => {});
    });

    describe('rehype plugins', () => {
      test('addinga  rehype plugin', () => {});
    });
  });
});
