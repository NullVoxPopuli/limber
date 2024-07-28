import { Compiler } from 'repl-sdk';
import { describe, expect, test } from 'vitest';

function escapeFence(code: string) {
  return code.replace(/`/g, '\\`');
}

function fenced(code: string, meta: string) {
  return '```' + meta + '\n' + escapeFence(code) + '\n```';
}

describe('markdown', () => {
  test('it works', async () => {
    let compiler = new Compiler();
    let element = await compiler.compile('md', `# Hello`);

    let h1 = element.querySelector('h1');

    expect(h1).toBeTruthy();
    expect(h1?.textContent).toContain('Hello');
  });

  describe('code fences', () => {
    let vue = `
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

    let jsxReact = `
      import React from 'react';

      export default <>
        <h1>Hello World</h1>

        GENERAL KENOBI!
      </>;
    `;

    let svelte = `
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
      let compiler = new Compiler();
      let element = await compiler.compile('md', `# Hello\n\n` + fenced(vue, 'vue live'));

      let h1 = element.querySelector('h1');
      let h2 = element.querySelector('h2');

      // getComputedStyle doesn't work without the element existing in the document
      document.body.appendChild(element);

      expect(h1).toBeTruthy();
      expect(h2).toBeTruthy();
      expect(h1?.textContent).toContain('Hello');
      expect(h2?.textContent).toContain('GENERAL KENOBI!');
      expect(window.getComputedStyle(h2!).color).toBe('rgb(255, 0, 0)');
    });

    test('jsx requires a flavor to be specified', async () => {
      let compiler = new Compiler();

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
      let compiler = new Compiler();
      let element = await compiler.compile('md', fenced(svelte, 'svelte live'));

      let h1 = element.querySelector('h1');

      // getComputedStyle doesn't work without the element existing in the document
      document.body.appendChild(element);

      expect(h1).toBeTruthy();
      expect(h1?.textContent).toContain('Hello');
      expect(window.getComputedStyle(h1!).color).toBe('rgb(255, 0, 0)');
    });

    test('mermaid (no live)', async () => {
      let compiler = new Compiler();
      let element = await compiler.compile('md', fenced(mermaid, 'mermaid'));

      let rootSVG = element.querySelector('svg');

      expect(rootSVG, 'Mermaid draws in SVG inside the <pre> tag').toBeTruthy();
    });
  });
});
