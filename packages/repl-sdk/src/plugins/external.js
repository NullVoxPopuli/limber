/**
 * @typedef {import('../types.ts').Plugin} Plugin
 */

import { storage } from '../fs/store.js';
import { EXTERNAL_PREFIX, externalPath, remoteUrlOf } from '../fs/url.js';
import { fsWorker } from '../fs/worker.js';
import { isRemote } from '../plugins.js';

/**
 * Files from a CDN, stored under `file:///external/<host>/`.
 *
 * A stored file keeps its CDN URL as `import.meta.url`,
 * so its relative imports, and the files it fetches itself, still point at the CDN.
 *
 * @returns {Plugin}
 */
export function externalFiles() {
  return {
    name: 'repl-sdk:external',

    resolveId(id, importer) {
      if (isRemote(id)) return id;
      if (!isRemote(importer)) return;

      /**
       * esm.sh imports its own files by absolute path, such as `/react@19.2.3/es2022/react.mjs`.
       */
      if (id.startsWith('.') || id.startsWith('/')) {
        return new URL(id, importer).href;
      }
    },

    async load(id) {
      if (!id.startsWith(EXTERNAL_PREFIX)) return;

      const url = remoteUrlOf(id);
      const path = externalPath(id);
      const stored = await storage.read(path);

      if (stored !== undefined) return { url, source: stored };

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Could not download ${url}: ${response.status} ${response.statusText}`);
      }

      const source = await response.text();

      await fsWorker().write(path, source);

      return { url, source };
    },
  };
}
