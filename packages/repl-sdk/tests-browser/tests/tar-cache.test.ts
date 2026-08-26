import { clearStoredTarballs, getTar } from 'repl-sdk/fs/npm';
import { openPack } from 'repl-sdk/fs/opfs-store';
import { afterAll, beforeAll, describe, expect, test } from 'vitest';

beforeAll(clearStoredTarballs);
afterAll(clearStoredTarballs);

describe('packages survive a reload', () => {
  test('a download lands in the store as a pack', async () => {
    const { manifest, files, contents } = await getTar('nanoid', 'latest');

    expect(contents).toBeUndefined();
    expect(files).toContain('index.browser.js');

    const pack = await openPack('nanoid', manifest.version);

    expect(pack).toBeDefined();
    expect(Object.keys(pack!.files)).toEqual(files);

    const [offset, length] = pack!.files['package.json']!;
    const stored = JSON.parse(await pack!.blob.slice(offset, offset + length).text());

    expect(stored.version).toBe(manifest.version);
  });
});
