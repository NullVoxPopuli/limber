import { expect, test } from 'vitest';

import { npmUrl, parseNpmUrl } from './url.js';

test('round trip', () => {
  const url = npmUrl('@scope/pkg', '1.2.3-beta.1', 'dist/nested/index.js');

  expect(parseNpmUrl(url)).toEqual({
    name: '@scope/pkg',
    version: '1.2.3-beta.1',
    path: 'dist/nested/index.js',
  });
});

test('relative resolution is plain URL math', () => {
  const parent = npmUrl('ember-source', '6.7.0', 'dist/packages/index.js');

  expect(new URL('../other/thing.js', parent).href).toBe(
    npmUrl('ember-source', '6.7.0', 'dist/other/thing.js')
  );
});
