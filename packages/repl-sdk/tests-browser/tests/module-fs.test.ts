import { createSourceHook, installer, storage } from 'repl-sdk/fs';
import { npmUrl, parseNpmUrl, pathOf } from 'repl-sdk/fs/url';
import { beforeAll, describe, expect, test, vi } from 'vitest';

/**
 * Spike: install a package from npm into a virtual fs and import it with no
 * resolve hook and no opaque request ids.
 *
 * nanoid is the target because it exercises everything that forces the current
 * design's hand:
 *   - an `exports` map with a `browser` condition, so entry resolution has to
 *     actually run (index.js uses Buffer and would throw here)
 *   - a relative import from that entry, `./url-alphabet/index.js`, which today
 *     needs the ?from= parent chain to resolve
 *   - a `./non-secure` subpath export
 *   - no dependencies
 */

/**
 * es-module-shims gives no way to see which URLs the loader asked for, so watch
 * the fs it reads from.
 */
const read = vi.spyOn(storage, 'read');
const reads = () => read.mock.calls.map(([path]) => `file://${path}`);

/* eslint-disable @typescript-eslint/no-explicit-any */
let importShim: any;
let version: string;

beforeAll(async () => {
  (globalThis as any).esmsInitOptions = {
    shimMode: true,
    mapOverrides: true,
    source: createSourceHook(storage, installer),
  };

  await import('es-module-shims');

  importShim = (globalThis as any).importShim;

  const installed = await installer.install('nanoid');

  version = installed.version;

  importShim.addImportMap({ imports: installer.imports });
});

describe('module fs', () => {
  test('unpacks the tarball to paths that say what they are', async () => {
    expect(await storage.exists(pathOf(npmUrl('nanoid', version, 'index.browser.js')))).toBe(true);
    expect(await storage.exists(pathOf(npmUrl('nanoid', version, 'url-alphabet/index.js')))).toBe(
      true
    );
    expect(await storage.exists(pathOf(npmUrl('nanoid', version, 'package.json')))).toBe(true);
  });

  test('entry resolution honors the exports map and its conditions', () => {
    expect(installer.imports).toEqual({
      nanoid: npmUrl('nanoid', version, 'index.browser.js'),
    });
  });

  test('the import map is the only resolution needed', async () => {
    const mod = await importShim('nanoid');

    expect(typeof mod.nanoid).toBe('function');
    expect(mod.nanoid(10)).toHaveLength(10);
  });

  test('a relative import inside the package resolves by URL alone', () => {
    /**
     * `./url-alphabet/index.js` imported from `index.browser.js`. No parent
     * chain, no ?from=, no Request tree: the parent URL already carried the
     * path, so the default resolver did it.
     */
    expect(reads()).toContain(npmUrl('nanoid', version, 'url-alphabet/index.js'));
  });

  test('nothing was served under an opaque id', () => {
    expect(reads().length).toBeGreaterThan(1);

    for (const url of reads()) {
      expect(url).not.toContain('repl-request-');
      expect(parseNpmUrl(url)).toMatchObject({ name: 'nanoid', version });
    }
  });

  test('subpath exports install against the same unpacked tarball', async () => {
    const before = (await storage.list(`/node_modules/.deps/nanoid@${version}`)).length;
    const { url } = await installer.install('nanoid/non-secure');

    expect(url).toBe(npmUrl('nanoid', version, 'non-secure/index.js'));
    expect((await storage.list(`/node_modules/.deps/nanoid@${version}`)).length).toBe(before);

    importShim.addImportMap({ imports: installer.imports });

    const mod = await importShim('nanoid/non-secure');

    expect(mod.nanoid(8)).toHaveLength(8);
  });
});

describe('npm urls', () => {
  test('round trip', () => {
    const url = npmUrl('@scope/pkg', '1.2.3-beta.1', 'dist/nested/index.js');

    expect(parseNpmUrl(url)).toEqual({
      name: '@scope/pkg',
      version: '1.2.3-beta.1',
      path: 'dist/nested/index.js',
    });
  });

  test('relative resolution is plain URL math', () => {
    const parent = npmUrl('ember-source', '6.7.0', 'dist/packages/index.js');

    expect(new URL('../other/thing.js', parent).href).toBe(
      npmUrl('ember-source', '6.7.0', 'dist/other/thing.js')
    );
  });
});
