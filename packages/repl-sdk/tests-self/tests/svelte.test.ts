import { Compiler } from 'repl-sdk';
import { describe, expect, test } from 'vitest';

describe('svelte', () => {
  test('it works', async () => {
    let compiler = new Compiler();
    let element = await compiler.compile(
      'svelte',
      `
      <script>
        let name = 'world';
      </script>
      <style>
        h1 { color: red; }
      </style>

      <h1>Hello {name}!</h1>
    `
    );

    // getComputedStyle doesn't work without the element existing in the document
    document.body.appendChild(element);

    let h1 = element.querySelector('h1');

    expect(h1.textContent).toContain('Hello world!');
    expect(window.getComputedStyle(h1).color).toBe('rgb(255, 0, 0)');
  });
});
