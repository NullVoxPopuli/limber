import { module, test } from 'qunit';

import { Storage } from 'repl-sdk/fs/storage';

import { nodeFs } from '#app/templates/edit/editor/typescript/node-fs.js';

import type { NodeFs } from '#app/templates/edit/editor/typescript/node-fs.js';

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
  let text = '';

  for (;;) {
    const n = await call<number>(fs, 'read', fd, buffer, 0, buffer.byteLength, null);

    if (n === 0) break;

    text += new TextDecoder().decode(buffer.subarray(0, n));
  }

  await call(fs, 'close', fd);

  return text;
}

async function fails(promise: Promise<unknown>) {
  try {
    await promise;
  } catch (error) {
    return (error as { code?: string }).code;
  }

  return undefined;
}

/**
 * Against the real origin private file system, the way the worker runs.
 */
module('Unit | typescript | nodeFs', function (hooks) {
  const storage = new Storage();
  let node: NodeFs;
  let stdout: string;

  hooks.beforeEach(async function () {
    stdout = '';
    node = nodeFs(storage, { onStdout: (bytes) => (stdout += new TextDecoder().decode(bytes)) });

    await storage.writePackage('node-fs-test', '1.0.0', {
      'package.json': { text: '{"name":"node-fs-test","version":"1.0.0"}' },
      'index.js': { text: 'export default 1;' },
      'lib/util.js': { text: 'lib' },
    });
    await storage.link('node-fs-test', '1.0.0');
    await storage.write('/src/node-fs-test.gjs', 'compiled');
  });

  hooks.afterEach(async function () {
    await storage.remove('/node_modules/.deps/node-fs-test@1.0.0');
    await storage.remove('/node_modules/node-fs-test');
    await storage.remove('/src/node-fs-test.gjs');
  });

  test('reads a file through a descriptor, in pieces', async function (assert) {
    const fd = await call<number>(node.fs, 'open', '/node_modules/node-fs-test/index.js', 0, 0);
    const buffer = new Uint8Array(6);

    assert.strictEqual(await call(node.fs, 'read', fd, buffer, 0, 6, null), 6);
    assert.strictEqual(new TextDecoder().decode(buffer), 'export');
    assert.strictEqual(await call(node.fs, 'read', fd, buffer, 0, 6, null), 6);
    assert.strictEqual(new TextDecoder().decode(buffer), ' defau');

    const stat = await call<{ size: number; mode: number }>(node.fs, 'fstat', fd);

    assert.strictEqual(stat.size, 17);
    assert.strictEqual(stat.mode & 0o170000, 0o100000, 'a regular file');

    await call(node.fs, 'close', fd);
    assert.strictEqual(await fails(call(node.fs, 'read', fd, buffer, 0, 6, null)), 'EBADF');
  });

  test('follows links and lists directories', async function (assert) {
    assert.strictEqual(await readAll(node.fs, '/node_modules/node-fs-test/lib/util.js'), 'lib');
    assert.strictEqual(
      await readAll(node.fs, '/node_modules/.deps/node-fs-test@1.0.0/lib/util.js'),
      'lib'
    );

    const listing = await call<string[]>(node.fs, 'readdir', '/node_modules/node-fs-test');

    assert.deepEqual(listing.sort(), ['index.js', 'lib', 'package.json']);

    const root = await call<string[]>(node.fs, 'readdir', '/');

    assert.true(root.includes('node_modules'));
    assert.true(root.includes('src'));

    const stat = await call<{ mode: number }>(node.fs, 'stat', '/node_modules/node-fs-test/lib');

    assert.strictEqual(stat.mode & 0o170000, 0o040000, 'a directory');
  });

  test('reports what is missing with the codes Go maps', async function (assert) {
    assert.strictEqual(await fails(call(node.fs, 'open', '/nope.js', 0, 0)), 'ENOENT');
    assert.strictEqual(await fails(call(node.fs, 'stat', '/node_modules/node-fs-nope')), 'ENOENT');
    assert.strictEqual(await fails(call(node.fs, 'readdir', '/src/node-fs-test.gjs')), 'ENOTDIR');
    assert.strictEqual(await fails(call(node.fs, 'readlink', '/src/node-fs-test.gjs')), 'EINVAL');
  });

  test('refuses writes to storage', async function (assert) {
    const flags = node.fs.constants.O_CREAT | node.fs.constants.O_WRONLY;

    assert.strictEqual(await fails(call(node.fs, 'open', '/src/new.js', flags, 0)), 'EROFS');
    assert.strictEqual(await fails(call(node.fs, 'mkdir', '/tmp', 0o755)), 'EROFS');
  });

  test('shadows storage with the overlay and lists it', async function (assert) {
    node.overlay('/node-fs-test.json', '{}');
    node.overlay('/src/node-fs-test.gjs', 'newer');

    assert.strictEqual(await readAll(node.fs, '/node-fs-test.json'), '{}');
    assert.strictEqual(await readAll(node.fs, '/src/node-fs-test.gjs'), 'newer');

    const root = await call<string[]>(node.fs, 'readdir', '/');

    assert.true(root.includes('node-fs-test.json'));

    const src = await call<string[]>(node.fs, 'readdir', '/src');

    assert.true(src.includes('node-fs-test.gjs'));
  });

  test('remembers what storage said until told otherwise', async function (assert) {
    assert.strictEqual(await fails(call(node.fs, 'stat', '/node_modules/node-fs-late')), 'ENOENT');

    await storage.writePackage('node-fs-late', '1.0.0', { 'package.json': { text: '{}' } });
    await storage.link('node-fs-late', '1.0.0');

    try {
      assert.strictEqual(
        await fails(call(node.fs, 'stat', '/node_modules/node-fs-late')),
        'ENOENT',
        'still absent'
      );

      node.invalidate();

      const stat = await call<{ mode: number }>(node.fs, 'stat', '/node_modules/node-fs-late');

      assert.strictEqual(stat.mode & 0o170000, 0o040000, 'seen after invalidate');
    } finally {
      await storage.remove('/node_modules/.deps/node-fs-late@1.0.0');
      await storage.remove('/node_modules/node-fs-late');
    }
  });

  test('feeds stdin and collects stdout', async function (assert) {
    const buffer = new Uint8Array(8);
    const pending = call<number>(node.fs, 'read', 0, buffer, 0, 8, null);

    node.pushStdin(new TextEncoder().encode('hi'));

    assert.strictEqual(await pending, 2);
    assert.strictEqual(new TextDecoder().decode(buffer.subarray(0, 2)), 'hi');
    assert.strictEqual(node.fs.writeSync(1, new TextEncoder().encode('out')), 3);
    assert.strictEqual(stdout, 'out');
  });
});
