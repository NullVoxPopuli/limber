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

it('works with from', () => {
  const request = Request.fromSpecifier('./foo.js?from=@iconify/utils/bar.js');

  expect(request.name).toBe('@iconify/utils');
  expect(request.from).toBe('@iconify/utils/bar.js');
  expect(request.to).toBe('./foo.js');
  expect(request.version).toBe('latest');
});

it('works with version and from', () => {
  const request = Request.fromSpecifier('./foo.js?from=@iconify/utils@1.0.0/bar.js');

  expect(request.name).toBe('@iconify/utils');
  expect(request.from).toBe('@iconify/utils/bar.js');
  expect(request.to).toBe('./foo.js');
  expect(request.version).toBe('1.0.0');
});

it('works with subpath imports', () => {
  const request = Request.fromSpecifier('#foo/hello.js?from=@iconify/utils/bar.js');

  expect(request.name).toBe('@iconify/utils');
  expect(request.from).toBe('@iconify/utils/bar.js');
  expect(request.to).toBe('#foo/hello.js');
  expect(request.version).toBe('latest');
});

it('works with unzipped URLs', () => {
  const request = Request.fromSpecifier(
    './lib/index.js?from=file%3A%2F%2F%2Ftgz.repl.sdk%2Funzipped%2F__name__%2Frehype-raw%5BAT%3AV%5Dlatest%2F__to__%2F.'
  );

  expect(request.name).toBe('rehype-raw');
  expect(request.from).toBe('rehype-raw');
  expect(request.to).toBe('./lib/index.js');
  expect(request.version).toBe('latest');
});

it('works with up URLs', () => {
  const request = Request.fromSpecifier(
    "./util/siblings.js?from=file%3A%2F%2F%2Ftgz.repl.sdk%2Funzipped%2F__name__%2Fhast-util-to-html%5BAT%3AV%5Dlatest%2F__to__%2F..%2Fomission%2Fclosing.js"
  );

  expect(request.name).toBe('hast-util-to-html');
  expect(request.from).toBe('hast-util-to-html/omission/closing.js');
  expect(request.to).toBe('./util/siblings.js');
  expect(request.version).toBe('latest');
})