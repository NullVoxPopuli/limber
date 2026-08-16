import { createSourceHook, getTar, Installer, npmUrl, parseNpmUrl, VFS } from 'repl-sdk/fs';
import { beforeAll, describe, expect, test } from 'vitest';

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

const vfs = new VFS();
const installer = new Installer({ vfs, getTar });

/* eslint-disable @typescript-eslint/no-explicit-any */
let importShim: any;
let version: string;

beforeAll(async () => {
  (globalThis as any).esmsInitOptions = {
    shimMode: true,
    mapOverrides: true,
    source: createSourceHook(vfs),
  };

  await import('es-module-shims');

  importShim = (globalThis as any).importShim;

  const installed = await installer.install('nanoid');

  version = installed.version;

  importShim.addImportMap({ imports: installer.imports });
});

describe('module fs', () => {
  test('unpacks the tarball to URLs that say what they are', () => {
    expect(vfs.has(npmUrl('nanoid', version, 'index.browser.js'))).toBe(true);
    expect(vfs.has(npmUrl('nanoid', version, 'url-alphabet/index.js'))).toBe(true);
    expect(vfs.has(npmUrl('nanoid', version, 'package.json'))).toBe(true);
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
    expect(vfs.reads).toContain(npmUrl('nanoid', version, 'url-alphabet/index.js'));
  });

  test('nothing was served under an opaque id', () => {
    expect(vfs.reads.length).toBeGreaterThan(1);

    for (const url of vfs.reads) {
      expect(url).not.toContain('repl-request-');
      expect(parseNpmUrl(url)).toMatchObject({ name: 'nanoid', version });
    }
  });

  test('subpath exports install against the same unpacked tarball', async () => {
    const before = vfs.size;
    const { url } = await installer.install('nanoid/non-secure');

    expect(url).toBe(npmUrl('nanoid', version, 'non-secure/index.js'));
    expect(vfs.size).toBe(before);

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
