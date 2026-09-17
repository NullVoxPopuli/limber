import { beforeEach, describe, expect, it } from 'vitest';

import { nodeFs } from './node-fs.js';
import { fakeStorage } from './storage.fake.js';

import type { NodeFs } from './node-fs.js';
import type { Storage } from './storage.js';

/**
 * The callback API, as promises, so the tests read like the Go side calls.
 */
function call<T = unknown>(fs: NodeFs['fs'], method: string, ...args: unknown[]) {
  return new Promise<T>((resolve, reject) => {
    const fn = fs[method] as (...all: unknown[]) => void;

    fn.call(fs, ...args, (error: null | Error, result: T) => {
      if (error) reject(error);
      else resolve(result);
    });
  });
}

async function readAll(fs: NodeFs['fs'], path: string) {
  const fd = await call<number>(fs, 'open', path, 0, 0);
  const buffer = new Uint8Array(64);
  const chunks: Uint8Array[] = [];

  for (;;) {
    const n = await call<number>(fs, 'read', fd, buffer, 0, buffer.byteLength, null);

    if (n === 0) break;

    chunks.push(buffer.slice(0, n));
  }

  await call(fs, 'close', fd);

  return new TextDecoder().decode(new Uint8Array(chunks.flatMap((c) => Array.from(c))));
}

describe('nodeFs', () => {
  let storage: Storage;
  let node: NodeFs;
  let stdout: string;

  beforeEach(async () => {
    ({ storage } = fakeStorage());
    stdout = '';
    node = nodeFs(storage, { onStdout: (bytes) => (stdout += new TextDecoder().decode(bytes)) });

    await storage.writePackage('pkg', '1.0.0', {
      'package.json': { text: '{"name":"pkg","version":"1.0.0"}' },
      'index.js': { text: 'export default 1;' },
      'lib/util.js': { text: 'lib' },
    });
    await storage.link('pkg', '1.0.0');
    await storage.write('/src/index.gjs', 'compiled');
  });

  it('reads a file through a descriptor, in pieces', async () => {
    const fd = await call<number>(node.fs, 'open', '/node_modules/pkg/index.js', 0, 0);
    const buffer = new Uint8Array(6);

    expect(await call(node.fs, 'read', fd, buffer, 0, 6, null)).toBe(6);
    expect(new TextDecoder().decode(buffer)).toBe('export');
    expect(await call(node.fs, 'read', fd, buffer, 0, 6, null)).toBe(6);
    expect(new TextDecoder().decode(buffer)).toBe(' defau');

    const stat = await call<{ size: number; mode: number }>(node.fs, 'fstat', fd);

    expect(stat.size).toBe(17);
    expect(stat.mode & 0o170000).toBe(0o100000);

    await call(node.fs, 'close', fd);
    await expect(call(node.fs, 'read', fd, buffer, 0, 6, null)).rejects.toMatchObject({
      code: 'EBADF',
    });
  });

  it('follows links and lists directories', async () => {
    expect(await readAll(node.fs, '/node_modules/pkg/lib/util.js')).toBe('lib');
    expect(await readAll(node.fs, '/node_modules/.deps/pkg@1.0.0/lib/util.js')).toBe('lib');
    expect((await call<string[]>(node.fs, 'readdir', '/node_modules/pkg')).sort()).toEqual([
      'index.js',
      'lib',
      'package.json',
    ]);
    expect(await call<string[]>(node.fs, 'readdir', '/')).toEqual(['node_modules', 'src']);

    const stat = await call<{ mode: number }>(node.fs, 'stat', '/node_modules/pkg/lib');

    expect(stat.mode & 0o170000).toBe(0o040000);
  });

  it('reports what is missing with the codes Go maps', async () => {
    await expect(call(node.fs, 'open', '/nope.js', 0, 0)).rejects.toMatchObject({ code: 'ENOENT' });
    await expect(call(node.fs, 'stat', '/node_modules/other')).rejects.toMatchObject({
      code: 'ENOENT',
    });
    await expect(call(node.fs, 'readdir', '/src/index.gjs')).rejects.toMatchObject({
      code: 'ENOTDIR',
    });
    await expect(call(node.fs, 'readlink', '/src/index.gjs')).rejects.toMatchObject({
      code: 'EINVAL',
    });
  });

  it('refuses writes to storage', async () => {
    await expect(
      call(
        node.fs,
        'open',
        '/src/new.js',
        node.fs.constants.O_CREAT | node.fs.constants.O_WRONLY,
        0
      )
    ).rejects.toMatchObject({ code: 'EROFS' });
    await expect(call(node.fs, 'mkdir', '/tmp', 0o755)).rejects.toMatchObject({ code: 'EROFS' });
  });

  it('shadows storage with the overlay and lists it', async () => {
    node.overlay('/tsconfig.json', '{}');
    node.overlay('/src/index.gjs', 'newer');

    expect(await readAll(node.fs, '/tsconfig.json')).toBe('{}');
    expect(await readAll(node.fs, '/src/index.gjs')).toBe('newer');
    expect((await call<string[]>(node.fs, 'readdir', '/')).sort()).toEqual([
      'node_modules',
      'src',
      'tsconfig.json',
    ]);
    expect(await call<string[]>(node.fs, 'readdir', '/src')).toEqual(['index.gjs']);
  });

  it('remembers what storage said until told otherwise', async () => {
    await expect(call(node.fs, 'stat', '/node_modules/late')).rejects.toMatchObject({
      code: 'ENOENT',
    });

    await storage.writePackage('late', '1.0.0', { 'package.json': { text: '{}' } });
    await storage.link('late', '1.0.0');

    await expect(call(node.fs, 'stat', '/node_modules/late')).rejects.toMatchObject({
      code: 'ENOENT',
    });

    node.invalidate();

    expect(await call(node.fs, 'stat', '/node_modules/late')).toMatchObject({
      mode: 0o040000 | 0o755,
    });
  });

  it('feeds stdin and collects stdout', async () => {
    const buffer = new Uint8Array(8);
    const pending = call<number>(node.fs, 'read', 0, buffer, 0, 8, null);

    node.pushStdin(new TextEncoder().encode('hi'));

    expect(await pending).toBe(2);
    expect(new TextDecoder().decode(buffer.subarray(0, 2))).toBe('hi');
    expect(node.fs.writeSync(1, new TextEncoder().encode('out'))).toBe(3);
    expect(stdout).toBe('out');
  });
});
