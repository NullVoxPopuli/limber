import { Compiler } from 'repl-sdk';
import { afterEach, beforeEach, describe, expect, test } from 'vitest';

// @ts-expect-error the plugin is not public, so it has no declaration file
import { macros } from '../../src/compilers/ember/macros.js';

import type { Plugin } from 'repl-sdk';

/**
 * Files of an addon, by path.
 */
const files: Record<string, string> = {
  'index.js': [
    `import { macroCondition, dependencySatisfies, importSync } from '@embroider/macros';`,
    `let value;`,
    `if (macroCondition(dependencySatisfies('nanoid', '>=5'))) {`,
    `  value = importSync('./new').value;`,
    `} else {`,
    `  value = importSync('./old').value;`,
    `}`,
    `if (macroCondition(false)) {`,
    `  importSync('./missing');`,
    `}`,
    `export default value;`,
  ].join('\n'),
  'new.js': `export const value = 'new';`,
  'old.js': `export const value = 'old';`,
};

const ROOT = 'file:///test/macros/';

/**
 * The module registry of the page keeps a URL for good,
 * so each test imports the addon from its own folder, as in `addon/pinned`.
 */
const addon: Plugin = {
  name: 'test:addon',
  resolveId(id) {
    if (id.startsWith('addon/')) return `${ROOT}${id.slice('addon/'.length)}/index.js`;
  },
  load(id) {
    if (!id.startsWith(ROOT)) return;

    return files[id.slice(ROOT.length).replace(/^[^/]+\//, '')];
  },
};

/**
 * Runs the text as a module, and shows its default export.
 */
function compiler() {
  return new Compiler({
    plugins: [addon, macros as Plugin],
    resolve: { nanoid: () => ({ nanoid: () => 'provided' }) },
    packages: { nanoid: { version: '5.1.5' } },
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

const docFor = (folder: string) =>
  [`import value from 'addon/${folder}';`, `export default value;`].join('\n');

describe('@embroider/macros', () => {
  const errors: unknown[] = [];

  const record = (event: ErrorEvent | PromiseRejectionEvent) => {
    errors.push('reason' in event ? event.reason : event.error);
  };

  beforeEach(() => {
    errors.length = 0;
    window.addEventListener('error', record);
    window.addEventListener('unhandledrejection', record);
  });

  afterEach(() => {
    window.removeEventListener('error', record);
    window.removeEventListener('unhandledrejection', record);
  });

  test('a module gets the branch for the provided version', async () => {
    const { element } = await compiler().compile('js', docFor('provided'));

    expect(element.textContent).toBe('new');
    expect(errors).toEqual([]);
  });

  test('a module gets the branch for the pinned version', async () => {
    const { element } = await compiler().compile('js', docFor('pinned'), {
      versions: { nanoid: '4.0.0' },
    });

    expect(element.textContent).toBe('old');
    expect(errors).toEqual([]);
  });
});
