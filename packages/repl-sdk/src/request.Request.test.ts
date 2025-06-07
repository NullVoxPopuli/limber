import { expect as errorExpect, it } from 'vitest';

const expect = errorExpect.soft;

import { getTarRequestId, idFromRequestUrl, Request } from './request.js';

it('works with scope', () => {
  const request = Request.of({ to: '@iconify/utils' });

  expect(request.name).toBe('@iconify/utils');
  expect(request.from).toBe(undefined);
  expect(request.to).toBe('.');
  expect(request.version).toBe('latest');
});

it('works with parent request id', () => {
  const url = getTarRequestId({ to: 'example-library' });
  const id = idFromRequestUrl(url);

  const request = Request.of({ to: './lib/index.js', from: id });

  expect(request.name).toBe('example-library');
  expect(request.version).toBe('latest');
  expect(request.from).toBe(Request.fromRequestId(id));
  expect(request.to).toBe('./lib/index.js');
});

it('works with version and from', () => {
  const url = getTarRequestId({ to: '@iconify/utils@1.0.0/bar.js' });
  const id = idFromRequestUrl(url);
  const request = Request.fromSpecifier(`./foo.js?from=${id}`);

  expect(request.name).toBe('@iconify/utils');
  expect(request.from).toBe(Request.fromRequestId(id));
  expect(request.to).toBe('./foo.js');
  expect(request.version).toBe('1.0.0');
});

it('works with subpath imports', () => {
  const url = getTarRequestId({ to: '@iconify/utils/bar.js' });
  const id = idFromRequestUrl(url);
  const request = Request.fromSpecifier(`#foo/hello.js?from=${id}`);

  expect(request.name).toBe('@iconify/utils');
  expect(request.from).toBe(Request.fromRequestId(id));
  expect(request.to).toBe('#foo/hello.js');
  expect(request.version).toBe('latest');
});

it('works with up URLs', () => {
  const url = getTarRequestId({ to: 'hast-util-to-html/utils/foo/bar.js' });
  const id = idFromRequestUrl(url);
  const request = Request.fromSpecifier(`../../utils/siblings.js?from=${id}`);

  expect(request.name).toBe('hast-util-to-html');
  expect(request.from).toBe(Request.fromRequestId(id));
  expect(request.to).toBe('../../utils/siblings.js');
  expect(request.version).toBe('latest');
});
