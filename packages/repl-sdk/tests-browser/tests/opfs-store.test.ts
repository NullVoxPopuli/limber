import {
  clearStore,
  readIndex,
  readTarball,
  writeIndex,
  writeTarball,
} from 'repl-sdk/fs/opfs-store';
import { afterAll, beforeAll, describe, expect, test } from 'vitest';

beforeAll(clearStore);
afterAll(clearStore);

describe('opfs store', () => {
  test('a tarball round-trips', async () => {
    const bytes = new TextEncoder().encode('not really a tarball').buffer;

    expect(await readTarball('@scope/pkg', '1.2.3')).toBeUndefined();

    await writeTarball('@scope/pkg', '1.2.3', bytes);

    const read = await readTarball('@scope/pkg', '1.2.3');

    expect(read && new TextDecoder().decode(read)).toBe('not really a tarball');
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

    expect(await readTarball('@scope/pkg', '1.2.3')).toBeUndefined();
    expect(await readIndex('@scope/pkg')).toBeUndefined();
  });
});
