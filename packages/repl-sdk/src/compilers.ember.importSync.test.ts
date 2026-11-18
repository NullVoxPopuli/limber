import { describe, expect, it } from 'vitest';

import { rewriteImportSync } from './compilers/ember/import-sync.js';

const macros = `data:text/javascript,${encodeURIComponent('export const importSync = () => {}, macroCondition = Boolean;')}`;

/**
 * Runs the rewritten module, with a stand-in for `@embroider/macros`.
 */
async function run(code: string): Promise<Record<string, unknown>> {
  const rewritten = rewriteImportSync(code) ?? '';

  expect(rewritten).not.toBe('');

  const source = rewritten.replace(`'@embroider/macros'`, JSON.stringify(macros));

  return (await import(
    /* @vite-ignore */ `data:text/javascript,${encodeURIComponent(source)}`
  )) as Record<string, unknown>;
}

describe('rewriteImportSync', () => {
  it('leaves code without @embroider/macros as it is', () => {
    expect(rewriteImportSync(`export const x = importSync('node:path');`)).toBe(undefined);
  });

  it('imports the module of each call', async () => {
    const module = await run(
      [
        `import { macroCondition, importSync } from '@embroider/macros';`,
        `export const join = importSync('node:path').join;`,
        `export const sep = importSync("node:path").sep;`,
      ].join('\n')
    );

    expect(module.join).toBeTypeOf('function');
    expect(module.sep).toBe('/');
  });

  it('follows a renamed importSync', async () => {
    const module = await run(
      [
        `import { importSync as load } from '@embroider/macros';`,
        `export const join = load('node:path').join;`,
      ].join('\n')
    );

    expect(module.join).toBeTypeOf('function');
  });

  it('throws only when code reads from a module that did not load', async () => {
    const module = await run(
      [
        `import { importSync } from '@embroider/macros';`,
        `importSync('node:no-such-module');`,
        `export const read = () => importSync('node:no-such-module').x;`,
      ].join('\n')
    );

    expect(() => (module.read as () => unknown)()).toThrow(/no-such-module/);
  });
});
