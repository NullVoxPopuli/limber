import { describe, expect, it } from 'vitest';

import { answerMacros } from './compilers/ember/macros.js';

const stub = `data:text/javascript,${encodeURIComponent(
  'export const importSync = () => {}, macroCondition = Boolean, dependencySatisfies = () => {}, appEmberSatisfies = () => {}, moduleExists = () => {};'
)}`;

/**
 * The versions that the module gets: ember-source 6.4.0 and nanoid 5.1.5.
 */
const versions: Record<string, string> = { 'ember-source': '6.4.0', nanoid: '5.1.5' };

const ctx = {
  versionOf: (name: string) => Promise.resolve(versions[name]),
};

/**
 * Runs the answered module, with a stand-in for `@embroider/macros`.
 */
async function run(...lines: string[]): Promise<Record<string, unknown>> {
  const answered = (await answerMacros(lines.join('\n'), 'file:///x.js', ctx)) ?? '';

  expect(answered).not.toBe('');

  const source = answered.replace(`'@embroider/macros'`, JSON.stringify(stub));

  return (await import(
    /* @vite-ignore */ `data:text/javascript,${encodeURIComponent(source)}`
  )) as Record<string, unknown>;
}

describe('answerMacros', () => {
  it('leaves code without @embroider/macros as it is', async () => {
    expect(
      await answerMacros(`export const x = importSync('node:path');`, 'file:///x.js', ctx)
    ).toBe(undefined);
  });

  it('answers the macros about versions from the versions of the module', async () => {
    const module = await run(
      `import { dependencySatisfies, appEmberSatisfies, moduleExists } from '@embroider/macros';`,
      `export const newEmber = appEmberSatisfies('>= 7.0.0');`,
      `export const oldEmber = appEmberSatisfies("^6.0.0");`,
      `export const nanoid = dependencySatisfies('nanoid', '^5.0.0');`,
      `export const missing = dependencySatisfies('lodash', '*');`,
      `export const exists = moduleExists('nanoid/non-secure');`,
      `export const absent = moduleExists('lodash/merge');`
    );

    expect(module).toMatchObject({
      newEmber: false,
      oldEmber: true,
      nanoid: true,
      missing: false,
      exists: true,
      absent: false,
    });
  });

  it('imports the module of each importSync', async () => {
    const module = await run(
      `import { macroCondition, importSync } from '@embroider/macros';`,
      `export const join = importSync('node:path').join;`,
      `export const sep = importSync("node:path").sep;`
    );

    expect(module.join).toBeTypeOf('function');
    expect(module.sep).toBe('/');
  });

  it('adds the extension that a relative importSync leaves out', async () => {
    const answered = await answerMacros(
      [
        `import { importSync } from '@embroider/macros';`,
        `export const a = importSync('./new/map');`,
        `export const b = importSync('./old/map.js');`,
        `export const c = importSync('../');`,
      ].join('\n'),
      'file:///x.js',
      ctx
    );

    expect(answered).toContain(
      `import("./new/map.js"), import("./old/map.js"), import("../index.js")`
    );
  });

  it('follows a renamed macro', async () => {
    const module = await run(
      `import { importSync as load, appEmberSatisfies as ember } from '@embroider/macros';`,
      `export const join = load('node:path').join;`,
      `export const oldEmber = ember('^6.0.0');`
    );

    expect(module.join).toBeTypeOf('function');
    expect(module.oldEmber).toBe(true);
  });

  it('throws only when code reads from a module that did not load', async () => {
    const module = await run(
      `import { importSync } from '@embroider/macros';`,
      `importSync('node:no-such-module');`,
      `export const read = () => importSync('node:no-such-module').x;`
    );

    expect(() => (module.read as () => unknown)()).toThrow(/no-such-module/);
  });
});
