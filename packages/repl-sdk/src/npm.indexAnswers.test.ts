import { describe, expect, test } from 'vitest';

import { INDEX_MAX_AGE, indexAnswers, pruneIndex } from './npm.js';

const index = {
  name: 'pkg',
  fetchedAt: 1000,
  'dist-tags': { latest: '2.0.0' },
  versions: { '1.0.0': { dist: { tarball: 'a' } }, '2.0.0': { dist: { tarball: 'b' } } },
};

describe('indexAnswers', () => {
  test('an exact version never expires', () => {
    expect(indexAnswers(index, '1.0.0', 1000 + INDEX_MAX_AGE * 100)).toBe(true);
  });

  test('a tag expires', () => {
    expect(indexAnswers(index, 'latest', 1000 + INDEX_MAX_AGE - 1)).toBe(true);
    expect(indexAnswers(index, 'latest', 1000 + INDEX_MAX_AGE)).toBe(false);
  });

  test('a range expires', () => {
    expect(indexAnswers(index, '^1.0.0', 1000)).toBe(true);
    expect(indexAnswers(index, '^1.0.0', 1000 + INDEX_MAX_AGE)).toBe(false);
  });
});

describe('pruneIndex', () => {
  test('keeps only what picking a tarball needs', () => {
    const packument = {
      name: 'pkg',
      readme: 'x'.repeat(10_000),
      'dist-tags': { latest: '1.0.0' },
      versions: {
        '1.0.0': { name: 'pkg', dependencies: { a: '1' }, dist: { tarball: 't', shasum: 's' } },
      },
    };

    expect(pruneIndex(packument, 5)).toEqual({
      name: 'pkg',
      fetchedAt: 5,
      'dist-tags': { latest: '1.0.0' },
      versions: { '1.0.0': { dist: { tarball: 't' } } },
    });
  });
});
