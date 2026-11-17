import { Compiler } from 'repl-sdk';
import { storage } from 'repl-sdk/fs';
import { describe, expect, test, vi } from 'vitest';

import type { Plugin } from 'repl-sdk';

/**
 * Runs the text as a module, and shows its default export.
 */
function compilerWith(plugins: Plugin[]) {
  return new Compiler({
    plugins,
    formats: {
      js: {
        codemirror: { lang: async () => undefined },
        compiler: async () => ({
          compile: async (text: string) => text,
          render: async (element: HTMLElement, value: unknown) => {
            element.textContent = String(value);
          },
        }),
      },
    },
  });
}

describe('plugins', () => {
  test('an async resolveId loads one instance for every importer', async () => {
    const files: Record<string, string> = {
      'file:///test/async/counter.js': [
        `let count = 0;`,
        `export function next() { return ++count; }`,
        `export default 'counter';`,
      ].join('\n'),
      'file:///test/async/second.js': [
        `import { next } from 'async-counter';`,
        `export const fromSecond = next();`,
      ].join('\n'),
    };

    const compiler = compilerWith([
      {
        name: 'test:async',
        async resolveId(source) {
          await Promise.resolve();

          if (source === 'async-counter') return 'file:///test/async/counter.js';
        },
        load(id) {
          return files[id];
        },
      },
    ]);

    const { element } = await compiler.compile(
      'js',
      [
        `import name, { next } from 'async-counter';`,
        `import { fromSecond } from 'file:///test/async/second.js';`,
        `export default [name, fromSecond, next()].join(' ');`,
      ].join('\n')
    );

    expect(element.textContent).toBe('counter 1 2');
  });

  test('a sync resolveId wins over npm', async () => {
    const compiler = compilerWith([
      {
        name: 'test:sync',
        resolveId(source) {
          if (source === 'nanoid') return 'file:///test/sync/nanoid.js';
        },
        load(id) {
          if (id === 'file:///test/sync/nanoid.js') return `export const nanoid = () => 'fake';`;
        },
      },
    ]);

    const { element } = await compiler.compile(
      'js',
      `import { nanoid } from 'nanoid';\nexport default nanoid();`
    );

    expect(element.textContent).toBe('fake');
  });

  test('transform changes loaded modules', async () => {
    const compiler = compilerWith([
      {
        name: 'test:load',
        load(id) {
          if (id === 'file:///test/transform/greeting.js') return `export default '__GREETING__';`;
        },
      },
      {
        name: 'test:transform',
        transform(code, id) {
          if (id.startsWith('file:///test/transform/')) {
            return code.replace('__GREETING__', 'hello');
          }
        },
      },
    ]);

    const { element } = await compiler.compile(
      'js',
      `import greeting from 'file:///test/transform/greeting.js';\nexport default greeting;`
    );

    expect(element.textContent).toBe('hello');
  });

  test('buildStart gets the versions of each compile', async () => {
    const seen: Record<string, string>[] = [];

    const compiler = compilerWith([
      {
        name: 'test:build-start',
        buildStart({ versions }) {
          seen.push(versions);
        },
      },
    ]);

    await compiler.compile('js', `export default 1;`, { versions: { a: '1.0.0' } });
    await compiler.compile('js', `export default 2;`, { versions: { a: '2.0.0' } });

    expect(seen).toEqual([{ a: '1.0.0' }, { a: '2.0.0' }]);
  });

  test('a CDN file is stored in the file system', async () => {
    const compiler = compilerWith([]);

    const { element } = await compiler.compile(
      'js',
      `import invariant from 'https://esm.sh/tiny-invariant@1.3.3';\nexport default typeof invariant;`
    );

    expect(element.textContent).toBe('function');

    await vi.waitFor(async () => {
      expect(await storage.exists('/external/esm.sh/tiny-invariant@1.3.3/#')).toBe(true);
    });
  });
});
