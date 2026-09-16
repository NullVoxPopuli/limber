import { createSourceHook, installer, storage } from 'repl-sdk/fs';
import { npmUrl, pathOf } from 'repl-sdk/fs/url';
import { fsWorker } from 'repl-sdk/fs/worker';
import { beforeAll, describe, expect, test, vi } from 'vitest';

/**
 * Does the `url` a source hook returns become the base for that module's own
 * relative imports?
 *
 * This decides whether resolution needs a pre-install crawl at all. If the
 * returned url wins, `resolve` can answer synchronously with a URL that only
 * names the package, and the async install can happen inside `source`, which
 * is allowed to be async. If the requested url wins, every package has to be
 * installed before anything resolves.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
const read = vi.spyOn(storage, 'read');
const reads = () => read.mock.calls.map(([path]) => path);

/**
 * What `resolve` can produce synchronously: the package, at no particular file.
 */
const PENDING = 'file:///node_modules/nanoid@latest/';

let importShim: any;
let version: string;

beforeAll(async () => {
  (globalThis as any).esmsInitOptions = {
    shimMode: true,
    mapOverrides: true,

    resolve(id: string, parentUrl: string, defaultResolve: any) {
      if (id === 'nanoid') return PENDING;

      return defaultResolve(id, parentUrl);
    },

    async source(url: string, fetchOpts: RequestInit, parent: string, defaultSourceHook: any) {
      if (url !== PENDING) {
        return createSourceHook(storage, installer)(url, fetchOpts, parent, defaultSourceHook);
      }

      const installed = await installer.install('nanoid');
      const text = await storage.read(pathOf(installed.url));

      return { url: installed.url, type: 'js', source: text };
    },
  };

  await import('es-module-shims');

  importShim = (globalThis as any).importShim;

  version = (await fsWorker().install('nanoid', 'latest')).manifest.version;
});

describe('response url', () => {
  test('the returned url is the base for the module relative imports', async () => {
    const mod = await importShim('nanoid');

    expect(mod.nanoid(10)).toHaveLength(10);

    /**
     * If the returned url wins, the sibling resolved against
     * .../nanoid@<version>/index.browser.js and landed on the real file.
     * If the requested url won, it resolved against .../nanoid@latest/ and
     * the import would have failed before we got here.
     */
    expect(reads()).toContain(pathOf(npmUrl('nanoid', version, 'url-alphabet/index.js')));
    expect(reads()).not.toContain('/node_modules/nanoid@latest/url-alphabet/index.js');
  });
});
