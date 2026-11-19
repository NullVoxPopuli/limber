import { Compiler } from 'repl-sdk';
import { describe, expect, test } from 'vitest';

/**
 * `upper` stands in for a format like gjs: its files are not modules
 * until its compiler runs.
 */
function projectCompiler() {
  return new Compiler({
    formats: {
      custom: {
        compiler: async () => ({
          compile: async (text: string) => text,
          render: async (element: HTMLElement, value: unknown) => {
            element.textContent =
              typeof value === 'function' ? String(await value()) : String(value);
          },
        }),
      },
      upper: {
        compiler: async () => ({
          compile: async (text: string) => `export default ${JSON.stringify(text.toUpperCase())};`,
          render: async () => {},
        }),
      },
    },
  });
}

describe('a project of several files', () => {
  test('the entry imports a sibling js file', async () => {
    const compiler = projectCompiler();

    const { element } = await compiler.compile(
      'custom',
      `import { name } from './name.js'; export default 'hello ' + name;`,
      { files: { 'name.js': `export const name = 'world';` } }
    );

    expect(element.textContent).toBe('hello world');
  });

  test('a sibling goes through the compiler of its extension', async () => {
    const compiler = projectCompiler();

    const { element } = await compiler.compile(
      'custom',
      `import shout from './shout.upper'; export default shout;`,
      { files: { 'shout.upper': 'quiet' } }
    );

    expect(element.textContent).toBe('QUIET');
  });

  test('folders, json, and imports between siblings', async () => {
    const compiler = projectCompiler();

    const { element } = await compiler.compile(
      'custom',
      `import { greet } from './lib/greet.js'; export default greet();`,
      {
        files: {
          'lib/greet.js': `import data from '../data.json'; export const greet = () => 'hi ' + data.who;`,
          'data.json': `{ "who": "folder" }`,
        },
      }
    );

    expect(element.textContent).toBe('hi folder');
  });

  test('imported css goes in the output, so it reaches a shadow root', async () => {
    const compiler = projectCompiler();

    const { element } = await compiler.compile(
      'custom',
      `import './styles.css'; export default 'styled';`,
      { files: { 'styles.css': 'p { --a: 1; }', 'unused.css': 'p { --b: 1; }' } }
    );

    const styles = Array.from(element.querySelectorAll('style'));

    expect(styles.map((style) => style.textContent)).toEqual(['p { --a: 1; }']);
    expect(document.head.querySelector('style[data-repl-src]')).toBe(null);
  });

  test('an edit to a sibling shows on the next compile', async () => {
    const compiler = projectCompiler();
    const entry = `import { n } from './n.js'; export default 'n=' + n;`;

    const first = await compiler.compile('custom', entry, {
      files: { 'n.js': 'export const n = 1;' },
    });
    const second = await compiler.compile('custom', entry, {
      files: { 'n.js': 'export const n = 2;' },
    });

    expect(first.element.textContent).toBe('n=1');
    expect(second.element.textContent).toBe('n=2');
  });

  test('a sibling can be imported after the entry loaded', async () => {
    const compiler = projectCompiler();

    const { element } = await compiler.compile(
      'custom',
      `export default async () => (await import('./later.js')).value;`,
      { files: { 'later.js': `export const value = 'late';` } }
    );

    expect(element.textContent).toBe('late');
  });

  test('a file with no compiler is an error that names it', async () => {
    const compiler = projectCompiler();

    await expect(
      compiler.compile('custom', `import './nope.xyz'; export default 1;`, {
        files: { 'nope.xyz': '' },
      })
    ).rejects.toThrow(/nope\.xyz/);
  });

  test('a missing sibling is an error that names it', async () => {
    const compiler = projectCompiler();

    await expect(
      compiler.compile('custom', `import './missing.js'; export default 1;`)
    ).rejects.toThrow(/Cannot find \.\/missing\.js/);
  });

  test('storage has what the user wrote', async () => {
    const compiler = projectCompiler();

    await compiler.compile('custom', `import './a.upper'; export default 1;`, {
      files: { 'a.upper': 'raw text' },
    });

    expect(await compiler.fs.read('/src/a.upper')).toBe('raw text');
  });
});
