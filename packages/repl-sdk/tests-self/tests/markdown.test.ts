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
});

