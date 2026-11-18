import { Compiler } from 'repl-sdk';
import { describe, expect, test } from 'vitest';

import type { Options } from 'repl-sdk';

/**
 * Runs the text as a module, and shows its default export.
 */
function compilerWith(options: Partial<Options>) {
  const dependencies: Record<string, string | undefined> = {};

  const compiler = new Compiler({
    ...options,
    on: {
      dependency: (name, version) => {
        dependencies[name] = version;
      },
    },
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

  return { compiler, dependencies };
}

const provided = {
  nanoid: () => ({ nanoid: () => 'provided' }),
};

const showId = [`import { nanoid } from 'nanoid';`, `export default nanoid(5);`].join('\n');

describe('the resolve option', () => {
  test('a pin that accepts the provided version keeps the provided module', async () => {
    const { compiler, dependencies } = compilerWith({
      resolve: provided,
      packages: { nanoid: { version: '5.1.5' } },
    });

    const { element } = await compiler.compile('js', showId, {
      versions: { nanoid: '^5.0.0' },
    });

    expect(element.textContent).toBe('provided');
    expect(dependencies).toEqual({ nanoid: undefined });
  });

  test('a pin that does not accept the provided version loads from npm', async () => {
    const { compiler, dependencies } = compilerWith({
      resolve: provided,
      packages: { nanoid: { version: '5.1.5' } },
    });

    const { element } = await compiler.compile('js', showId, {
      versions: { nanoid: '5.0.9' },
    });

    expect(element.textContent).toHaveLength(5);
    expect(element.textContent).not.toBe('provided');
    expect(dependencies).toEqual({ nanoid: '5.0.9' });
  });

  test('a pin of a package that a module was built with loads that module from npm too', async () => {
    const { compiler } = compilerWith({
      resolve: provided,
      packages: {
        'tiny-invariant': { version: '1.3.3' },
        nanoid: { builtWith: ['tiny-invariant'] },
      },
    });

    const unpinned = await compiler.compile('js', showId);

    expect(unpinned.element.textContent).toBe('provided');

    const pinned = await compiler.compile('js', showId, {
      versions: { 'tiny-invariant': '1.3.1' },
    });

    expect(pinned.element.textContent).toHaveLength(5);
    expect(pinned.element.textContent).not.toBe('provided');
  });

  test('a module is reported under the package that lists it', async () => {
    const { compiler, dependencies } = compilerWith({
      resolve: { 'id-alias': provided.nanoid },
      packages: { nanoid: { modules: ['id-alias'] } },
    });

    const { element } = await compiler.compile(
      'js',
      [`import { nanoid } from 'id-alias';`, `export default nanoid(5);`].join('\n')
    );

    expect(element.textContent).toBe('provided');
    expect(dependencies).toEqual({ nanoid: undefined });
  });
});
