import { beforeEach, describe, expect, it } from 'vitest';

import { Storage } from './storage.js';

/**
 * Enough of the File System Access API for the storage to run under Node:
 * directories, files, `entries`, `removeEntry`, `getFile`, and `createWritable`.
 */
class NotFoundError extends Error {
  override name = 'NotFoundError';
}

class FakeFile {
  kind = 'file' as const;
  text = '';

  getFile() {
    const text = this.text;

    return Promise.resolve({ text: () => Promise.resolve(text) });
  }

  createWritable() {
    return Promise.resolve({
      write: (chunk: string) => {
        this.text = chunk;

        return Promise.resolve();
      },
      close: () => Promise.resolve(),
    });
  }
}

class FakeDirectory {
  kind = 'directory' as const;
  children = new Map<string, FakeDirectory | FakeFile>();

  getDirectoryHandle(name: string, options?: { create?: boolean }) {
    let child = this.children.get(name);

    if (!child) {
      if (!options?.create) return Promise.reject(new NotFoundError(name));
      child = new FakeDirectory();
      this.children.set(name, child);
    }

    if (child.kind !== 'directory') return Promise.reject(new TypeError(`${name} is a file`));

    return Promise.resolve(child);
  }

  getFileHandle(name: string, options?: { create?: boolean }) {
    let child = this.children.get(name);

    if (!child) {
      if (!options?.create) return Promise.reject(new NotFoundError(name));
      child = new FakeFile();
      this.children.set(name, child);
    }

    if (child.kind !== 'file') return Promise.reject(new TypeError(`${name} is a directory`));

    return Promise.resolve(child);
  }

  removeEntry(name: string) {
    if (!this.children.delete(name)) return Promise.reject(new NotFoundError(name));

    return Promise.resolve();
  }

  *entries() {
    for (const entry of this.children) yield entry;
  }
}

export function fakeStorage() {
  const origin = new FakeDirectory();

  return { origin, storage: new Storage(() => Promise.resolve(origin as never)) };
}

function contentsFor(files: Record<string, string>) {
  return Object.fromEntries(Object.entries(files).map(([path, text]) => [path, { text }]));
}

describe('Storage', () => {
  let origin: FakeDirectory;
  let storage: Storage;

  beforeEach(() => {
    ({ origin, storage } = fakeStorage());
  });

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
  });

  describe('packages', () => {
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
      expect(await storage.read('/node_modules/nanoid@6.0.1/non-secure/index.js')).toBe(
        'export const id = 2;'
      );
    });

    it('keeps scoped packages under their scope', async () => {
      const manifest = { name: '@scope/name', version: '1.0.0' };

      await storage.writePackage('@scope/name', '1.0.0', {
        'package.json': { text: JSON.stringify(manifest) },
      });

      const nodeModules = await origin.getDirectoryHandle('node_modules');
      const scope = await nodeModules.getDirectoryHandle('@scope');

      expect(Array.from(scope.children.keys())).toEqual(['name@1.0.0']);
      expect(await storage.installed()).toEqual({ '@scope/name': ['1.0.0'] });
      expect((await storage.readPackage('@scope/name', '1.0.0'))?.manifest).toEqual(manifest);
    });

    it('ignores a package without its marker', async () => {
      const nodeModules = await origin.getDirectoryHandle('node_modules', { create: true });
      const half = await nodeModules.getDirectoryHandle('broken@1.0.0', { create: true });
      const file = await half.getFileHandle('package.json', { create: true });

      file.text = JSON.stringify({ name: 'broken', version: '1.0.0' });

      expect(await storage.installed()).toEqual({});
      expect(await storage.readPackage('broken', '1.0.0')).toBeUndefined();
    });

    it('removes a package and clears everything', async () => {
      await storage.writePackage('a', '1.0.0', { 'package.json': { text: '{}' } });
      await storage.writePackage('b', '1.0.0', { 'package.json': { text: '{}' } });
      await storage.write('/src/index.gjs', '');

      await storage.remove('/node_modules/a@1.0.0');

      expect(Object.keys(await storage.installed())).toEqual(['b']);

      await storage.clear();

      expect(await storage.installed()).toEqual({});
      expect(await storage.exists('/src/index.gjs')).toBe(false);
    });
  });
});
