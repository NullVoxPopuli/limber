import { clearStore, openPack, readIndex, writeIndex, writePack } from 'repl-sdk/fs/opfs-store';
import { afterAll, beforeAll, describe, expect, test } from 'vitest';

beforeAll(clearStore);
afterAll(clearStore);

const bytes = (text: string) => new TextEncoder().encode(text);

describe('opfs store', () => {
  test('a pack round-trips, one slice per file', async () => {
    expect(await openPack('@scope/pkg', '1.2.3')).toBeUndefined();

    const files = await writePack('@scope/pkg', '1.2.3', [
      { path: 'index.js', data: bytes('export const a = 1;') },
      { path: 'lib/b.js', data: bytes('export const b = 2;') },
    ]);

    expect(files).toEqual({ 'index.js': [0, 19], 'lib/b.js': [19, 19] });

    const pack = await openPack('@scope/pkg', '1.2.3');

    expect(pack?.files).toEqual(files);

    const [offset, length] = pack!.files['lib/b.js']!;

    expect(await pack!.blob.slice(offset, offset + length).text()).toBe('export const b = 2;');
  });

  test('an index round-trips', async () => {
    const index = {
      name: '@scope/pkg',
      fetchedAt: 1,
      'dist-tags': { latest: '1.2.3' },
      versions: { '1.2.3': { dist: { tarball: 'https://example.com/pkg-1.2.3.tgz' } } },
    };

    expect(await readIndex('@scope/pkg')).toBeUndefined();

    await writeIndex('@scope/pkg', index);

    expect(await readIndex('@scope/pkg')).toEqual(index);
  });

  test('clear forgets everything', async () => {
    await clearStore();

    expect(await openPack('@scope/pkg', '1.2.3')).toBeUndefined();
    expect(await readIndex('@scope/pkg')).toBeUndefined();
  });
});
