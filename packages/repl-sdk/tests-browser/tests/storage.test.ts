import { Storage } from 'repl-sdk/fs/storage';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

/**
 * Against the real origin private file system.
 *
 * Each test gets a directory of its own as the root, because other tests in
 * this suite share the origin and keep what they installed.
 */
let root: FileSystemDirectoryHandle;
let rootName: string;
let storage: Storage;

function contentsFor(files: Record<string, string>) {
  return Object.fromEntries(Object.entries(files).map(([path, text]) => [path, { text }]));
}

async function writeFile(directory: FileSystemDirectoryHandle, name: string, text: string) {
  const handle = await directory.getFileHandle(name, { create: true });
  const writable = await handle.createWritable();

  await writable.write(text);
  await writable.close();
}

beforeEach(async () => {
  const origin = await navigator.storage.getDirectory();

  rootName = `storage-test-${crypto.randomUUID()}`;
  root = await origin.getDirectoryHandle(rootName, { create: true });
  storage = new Storage(() => Promise.resolve(root));
});

afterEach(async () => {
  const origin = await navigator.storage.getDirectory();

  await origin.removeEntry(rootName, { recursive: true });
});

describe('Storage', () => {
  describe('files', () => {
    it('reads what it wrote', async () => {
      await storage.write('/src/index.gjs', 'export default 1;');

      expect(await storage.read('/src/index.gjs')).toBe('export default 1;');
      expect(await storage.exists('/src/index.gjs')).toBe(true);
      expect(await storage.read('/src/other.gjs')).toBeUndefined();
      expect(await storage.exists('/src/other.gjs')).toBe(false);
    });

    it('creates the directories a path needs', async () => {
      await storage.write('/a/b/c.txt', 'deep');

      expect(await storage.list('/a')).toEqual(['/a/b/c.txt']);
    });

    it('removes files and directories, and tolerates a missing one', async () => {
      await storage.write('/src/index.gjs', '1');
      await storage.write('/src/nested/x.js', '2');

      await storage.remove('/src/index.gjs');
      await storage.remove('/src/index.gjs');

      expect(await storage.list('/src')).toEqual(['/src/nested/x.js']);

      await storage.remove('/src');

      expect(await storage.list('/src')).toEqual([]);
    });

    it('tells a file from a directory of the same name', async () => {
      await storage.write('/src/index.gjs', '1');

      expect(await storage.read('/src')).toBeUndefined();
      expect(await storage.list('/src/index.gjs')).toEqual([]);
    });
  });

  describe('packages', () => {
    it('writes many files into shared new directories', async () => {
      const texts: Record<string, string> = { 'package.json': '{}' };

      for (let i = 0; i < 60; i++) {
        texts[`dist/packages/${i % 3}/deep/${i}.js`] = `export default ${i};`;
      }

      const written = await storage.writePackage('many', '1.0.0', contentsFor(texts));

      expect(written.files.size).toBe(61);

      const read = await storage.readPackage('many', '1.0.0');

      expect(read?.files.size).toBe(61);
      expect(await storage.read('/node_modules/.deps/many@1.0.0/dist/packages/2/deep/59.js')).toBe(
        'export default 59;'
      );
    });

    it('round-trips a package', async () => {
      const manifest = { name: 'nanoid', version: '6.0.1' };
      const contents = contentsFor({
        'package.json': JSON.stringify(manifest),
        'index.js': 'export const id = 1;',
        'non-secure/index.js': 'export const id = 2;',
      });

      const written = await storage.writePackage('nanoid', '6.0.1', contents);

      expect(written.manifest).toEqual(manifest);
      expect(await storage.installed()).toEqual({ nanoid: ['6.0.1'] });

      const read = await storage.readPackage('nanoid', '6.0.1');

      expect(read?.manifest).toEqual(manifest);
      expect(Array.from(read?.files ?? []).sort()).toEqual([
        'index.js',
        'non-secure/index.js',
        'package.json',
      ]);
      expect(await storage.read('/node_modules/.deps/nanoid@6.0.1/non-secure/index.js')).toBe(
        'export const id = 2;'
      );
    });

    it('keeps scoped packages under their scope', async () => {
      const manifest = { name: '@scope/name', version: '1.0.0' };

      await storage.writePackage('@scope/name', '1.0.0', {
        'package.json': { text: JSON.stringify(manifest) },
      });

      const deps = await root
        .getDirectoryHandle('node_modules')
        .then((d) => d.getDirectoryHandle('.deps'));
      const scope = await deps.getDirectoryHandle('@scope');
      const names = [];

      for await (const name of scope.keys()) names.push(name);

      expect(names).toEqual(['name@1.0.0']);
      expect(await storage.installed()).toEqual({ '@scope/name': ['1.0.0'] });
      expect((await storage.readPackage('@scope/name', '1.0.0'))?.manifest).toEqual(manifest);
    });

    it('ignores a package without its marker', async () => {
      const deps = await root
        .getDirectoryHandle('node_modules', { create: true })
        .then((d) => d.getDirectoryHandle('.deps', { create: true }));
      const half = await deps.getDirectoryHandle('broken@1.0.0', { create: true });

      await writeFile(half, 'package.json', JSON.stringify({ name: 'broken', version: '1.0.0' }));

      expect(await storage.installed()).toEqual({});
      expect(await storage.readPackage('broken', '1.0.0')).toBeUndefined();
    });

    it('stores a package as a pack and its index', async () => {
      await storage.writePackage(
        'packed',
        '1.0.0',
        contentsFor({
          'package.json': '{}',
          'dist/a.js': 'export const a = "ä";',
          'dist/nested/b.js': 'export const b = 2;',
        })
      );

      const deps = await root
        .getDirectoryHandle('node_modules')
        .then((d) => d.getDirectoryHandle('.deps'));
      const dir = await deps.getDirectoryHandle('packed@1.0.0');
      const names = [];

      for await (const name of dir.keys()) names.push(name);

      expect(names.sort()).toEqual(['.complete-3', '.pack']);
      expect(await storage.read('/node_modules/.deps/packed@1.0.0/dist/a.js')).toBe(
        'export const a = "ä";'
      );
      expect(await storage.read('/node_modules/.deps/packed@1.0.0/dist')).toBeUndefined();
      expect(await storage.read('/node_modules/.deps/packed@1.0.0/.pack')).toBeUndefined();
      expect(await storage.stat('/node_modules/.deps/packed@1.0.0/dist/nested')).toMatchObject({
        type: 'directory',
      });
      expect(
        await storage.stat('/node_modules/.deps/packed@1.0.0/dist/missing.js')
      ).toBeUndefined();
      expect(
        (await storage.entries('/node_modules/.deps/packed@1.0.0/dist'))
          ?.map((entry) => `${entry.type}:${entry.name}`)
          .sort()
      ).toEqual(['directory:nested', 'file:a.js']);
      expect(await storage.list('/node_modules/.deps/packed@1.0.0/dist')).toEqual([
        '/node_modules/.deps/packed@1.0.0/dist/a.js',
        '/node_modules/.deps/packed@1.0.0/dist/nested/b.js',
      ]);
    });

    it('replaces a package from an older unpacker', async () => {
      const deps = await root
        .getDirectoryHandle('node_modules', { create: true })
        .then((d) => d.getDirectoryHandle('.deps', { create: true }));
      const old = await deps.getDirectoryHandle('old@1.0.0', { create: true });

      await writeFile(old, 'package.json', '{}');
      await writeFile(old, 'stale.js', 'stale');
      await writeFile(old, '.complete-2', '');

      expect(await storage.installed()).toEqual({});
      expect(await storage.readPackage('old', '1.0.0')).toBeUndefined();

      await storage.writePackage('old', '1.0.0', contentsFor({ 'package.json': '{}' }));

      expect(await storage.installed()).toEqual({ old: ['1.0.0'] });
      expect(await storage.exists('/node_modules/.deps/old@1.0.0/stale.js')).toBe(false);
      expect(await storage.list('/node_modules/.deps/old@1.0.0')).toEqual([
        '/node_modules/.deps/old@1.0.0/package.json',
      ]);
    });

    it('removes a package and clears everything', async () => {
      await storage.writePackage('a', '1.0.0', { 'package.json': { text: '{}' } });
      await storage.writePackage('b', '1.0.0', { 'package.json': { text: '{}' } });
      await storage.write('/src/index.gjs', '');

      await storage.remove('/node_modules/.deps/a@1.0.0');

      expect(Object.keys(await storage.installed())).toEqual(['b']);

      await storage.clear();

      expect(await storage.installed()).toEqual({});
      expect(await storage.exists('/src/index.gjs')).toBe(false);
    });

    it('finds a directory again after it was removed and rewritten', async () => {
      await storage.writePackage('a', '1.0.0', { 'package.json': { text: '{"v":1}' } });
      await storage.remove('/node_modules/.deps/a@1.0.0');
      await storage.writePackage('a', '1.0.0', { 'package.json': { text: '{"v":2}' } });

      expect(await storage.read('/node_modules/.deps/a@1.0.0/package.json')).toBe('{"v":2}');
    });
  });

  describe('stat, entries, and bytes', () => {
    it('describes files and directories', async () => {
      await storage.write('/src/index.gjs', 'hello');

      expect(await storage.stat('/src/index.gjs')).toMatchObject({ type: 'file', size: 5 });
      expect(await storage.stat('/src')).toMatchObject({ type: 'directory' });
      expect(await storage.stat('/')).toMatchObject({ type: 'directory' });
      expect(await storage.stat('/nope')).toBeUndefined();
      expect(await storage.readBytes('/src/index.gjs')).toEqual(new TextEncoder().encode('hello'));
    });

    it('lists a directory without markers, through links', async () => {
      await storage.writePackage('pkg', '1.0.0', {
        'package.json': { text: '{}' },
        'lib/a.js': { text: '' },
      });
      await storage.link('pkg', '1.0.0');

      const entries = (await storage.entries('/node_modules/pkg')) ?? [];

      expect(entries.map((entry) => `${entry.type}:${entry.name}`).sort()).toEqual([
        'directory:lib',
        'file:package.json',
      ]);
      expect(await storage.entries('/node_modules/missing')).toBeUndefined();
      expect(await storage.stat('/node_modules/pkg/lib/a.js')).toMatchObject({ type: 'file' });
    });
  });

  describe('links', () => {
    it('reads through a link into .deps', async () => {
      for (const version of ['1.0.0', '2.0.0']) {
        await storage.writePackage('pkg', version, {
          'package.json': { text: JSON.stringify({ name: 'pkg', version }) },
          'index.js': { text: `export default '${version}';` },
          'lib/util.js': { text: `export const v = '${version}';` },
        });
      }

      await storage.link('pkg', '2.0.0');

      expect(await storage.linkOf('pkg')).toBe('2.0.0');
      expect(await storage.links()).toEqual({ pkg: '2.0.0' });
      expect(await storage.resolve('/node_modules/pkg/lib/util.js')).toBe(
        '/node_modules/.deps/pkg@2.0.0/lib/util.js'
      );
      expect(await storage.read('/node_modules/pkg/index.js')).toBe(`export default '2.0.0';`);
      expect(await storage.exists('/node_modules/pkg/lib/util.js')).toBe(true);
      expect((await storage.list('/node_modules/pkg')).sort()).toEqual([
        '/node_modules/pkg/index.js',
        '/node_modules/pkg/lib/util.js',
        '/node_modules/pkg/package.json',
      ]);
    });

    it('links scoped names', async () => {
      await storage.writePackage('@scope/name', '1.0.0', {
        'package.json': { text: '{}' },
        'index.js': { text: 'scoped' },
      });
      await storage.link('@scope/name', '1.0.0');

      expect(await storage.links()).toEqual({ '@scope/name': '1.0.0' });
      expect(await storage.read('/node_modules/@scope/name/index.js')).toBe('scoped');
    });

    it('leaves a path alone when there is no link', async () => {
      expect(await storage.resolve('/node_modules/missing/index.js')).toBe(
        '/node_modules/missing/index.js'
      );
      expect(await storage.read('/node_modules/missing/index.js')).toBeUndefined();
      expect(await storage.resolve('/node_modules/.deps/pkg@1.0.0/index.js')).toBe(
        '/node_modules/.deps/pkg@1.0.0/index.js'
      );
    });
  });
});
