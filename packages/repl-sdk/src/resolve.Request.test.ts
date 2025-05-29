import { expect as errorExpect, it } from 'vitest';

const expect = errorExpect.soft;

import { Request } from './resolve.js';

it('works with scope', () => {
  const request = Request.fromSpecifier('@iconify/utils');

  expect(request.name).toBe('@iconify/utils');
  expect(request.from).toBe(undefined);
  expect(request.to).toBe('.');
  expect(request.version).toBe('latest');
});

it('works with from / to', () => {
  const request = Request.fromSpecifier(
    '@iconify/utils/foo.js?from=@iconify/utils/bar.js&to=./foo.js'
  );

  expect(request.name).toBe('@iconify/utils');
  expect(request.from).toBe('@iconify/utils/bar.js');
  expect(request.to).toBe('./foo.js');
  expect(request.version).toBe('latest');
});

it('works with version and from / to', () => {
  const request = Request.fromSpecifier(
    '@iconify/utils@1.0.0/foo.js?from=@iconify/utils/bar.js&to=./foo.js'
  );

  expect(request.name).toBe('@iconify/utils');
  expect(request.from).toBe('@iconify/utils/bar.js');
  expect(request.to).toBe('./foo.js');
  expect(request.version).toBe('1.0.0');
});
