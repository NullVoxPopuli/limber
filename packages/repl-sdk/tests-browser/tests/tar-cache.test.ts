import { readIndex, readTarball } from 'repl-sdk/fs/opfs-store';
import { clearStoredTarballs, getTar } from 'repl-sdk/fs/npm';
import { afterAll, beforeAll, describe, expect, test } from 'vitest';

beforeAll(clearStoredTarballs);
afterAll(clearStoredTarballs);

describe('tarballs survive a reload', () => {
  test('a download lands in the store', async () => {
    const { manifest } = await getTar('nanoid', 'latest');

    /**
     * Writes are fire-and-forget in the worker.
     */
    await new Promise((resolve) => setTimeout(resolve, 200));

    const index = await readIndex('nanoid');

    expect(index?.['dist-tags'].latest).toBe(manifest.version);
    expect(index?.versions[manifest.version]?.dist.tarball).toMatch(/\.tgz$/);

    const bytes = await readTarball('nanoid', manifest.version);

    expect(bytes?.byteLength).toBeGreaterThan(1000);
  });
});
