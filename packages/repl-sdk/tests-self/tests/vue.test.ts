import { Compiler } from 'repl-sdk';
import { describe, expect, test } from 'vitest';

describe('vue', () => {
  test('it works', async () => {
    const compiler = new Compiler();
    // Vue comes from esm.sh
    const { element } = await compiler.compile(
      'vue',
      `
      <style scoped>
        h1 { color: red; }
      </style>
      <script setup>
        import { ref } from 'vue'

        const count = ref(0)
      </script>

      <template>
        <h1>Hello World</h1>

        GENERAL KENOBI!
      </template>
    `
    );

    // getComputedStyle doesn't work without the element existing in the document
    document.body.appendChild(element);

    const h1 = element.querySelector('h1');

    expect(h1).toBeTruthy();
    expect(h1?.textContent).toContain('Hello World');
    expect(window.getComputedStyle(h1).color).toBe('rgb(255, 0, 0)');
    expect(element.textContent).toContain('Hello World');
  });
});
