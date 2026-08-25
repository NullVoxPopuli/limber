import { beforeAll, describe, expect, test } from 'vitest';

/**
 * Can a scope registered while a load is in flight steer the resolution of the
 * module that triggered it?
 *
 * This decides how per-importer versions work. Import map scopes are the web's
 * node_modules nesting, and mho builds them the same way: crawl package.json,
 * map each dependency name to where that dependency actually lives. But the
 * crawl here happens lazily, inside the source hook, so the scope for package
 * A has to be added while A is being fetched and still apply to A's own
 * imports.
 *
 * If it does, no pre-crawl is needed for versions either.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
const files: Record<string, string> = {
  'file:///pkg/a@1.0.0/index.js': `
    import { which } from 'dep';
    export const answer = 'a says ' + which;
  `,
  'file:///pkg/b@1.0.0/index.js': `
    import { which } from 'dep';
    export const answer = 'b says ' + which;
  `,
  'file:///pkg/dep@1.0.0/index.js': `export const which = 'dep@1';`,
  'file:///pkg/dep@2.0.0/index.js': `export const which = 'dep@2';`,
};

/**
 * What each package depends on, the way a package.json would say it.
 */
const manifests: Record<string, Record<string, string>> = {
  'a@1.0.0': { dep: '1.0.0' },
  'b@1.0.0': { dep: '2.0.0' },
};

let importShim: any;
const resolved: string[] = [];

beforeAll(async () => {
  (globalThis as any).esmsInitOptions = {
    shimMode: true,
    mapOverrides: true,

    resolve(id: string, parentUrl: string, defaultResolve: any) {
      try {
        const mapped = defaultResolve(id, parentUrl);

        if (mapped) {
          resolved.push(`${id} from ${parentUrl} -> ${mapped}`);

          return mapped;
        }
      } catch {
        /* not in the map */
      }

      if (id.startsWith('.') || id.includes(':')) return defaultResolve(id, parentUrl);

      return `file:///pkg/${id}`;
    },

    async source(url: string, fetchOpts: any, parent: string, defaultSourceHook: any) {
      const direct = files[url];

      if (direct) return { url, type: 'js', source: direct };

      /**
       * A provisional URL: `file:///pkg/a`. Pretend we just downloaded it,
       * learned its version and its dependency ranges, and register a scope
       * before handing back the source.
       */
      const name = url.replace('file:///pkg/', '');
      const version = name === 'a' ? '1.0.0' : name === 'b' ? '1.0.0' : '1.0.0';
      const real = `file:///pkg/${name}@${version}/index.js`;
      const deps = manifests[`${name}@${version}`];

      if (deps) {
        importShim.addImportMap({
          scopes: {
            [`file:///pkg/${name}@${version}/`]: Object.fromEntries(
              Object.entries(deps).map(([dep, range]) => [
                dep,
                `file:///pkg/${dep}@${range}/index.js`,
              ])
            ),
          },
        });
      }

      if (files[real]) return { url: real, type: 'js', source: files[real] };

      return defaultSourceHook(url, fetchOpts, parent);
    },
  };

  await import('es-module-shims');

  importShim = (globalThis as any).importShim;
});

describe('import map scopes', () => {
  test('a scope added during a load applies to that load', async () => {
    const a = await importShim('a');

    expect(a.answer).toBe('a says dep@1');
  });

  test('two packages get different versions of the same dependency', async () => {
    const b = await importShim('b');

    expect(b.answer).toBe('b says dep@2');
  });
});
