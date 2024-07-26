import { describe, expect, test } from 'vitest'
import { Compiler } from 'repl-sdk';

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

    test('vue live', async () => {
      let compiler = new Compiler();
      let element = await compiler.compile('md', `# Hello\n\n` + '```vue live\n' + vue + '\n```');

      let h1 = element.querySelector('h1');
      let h2 = element.querySelector('h2');

      // getComputedStyle doesn't work without the element existing in the document
      document.body.appendChild(element);

      expect(h1).toBeTruthy();
      expect(h2).toBeTruthy();
      expect(h1?.textContent).toContain('Hello');
      expect(h2?.textContent).toContain('GENERAL KENOBI!');
      expect(window.getComputedStyle(h2!).color).toBe('rgb(255, 0, 0)');
    })
  });
});

