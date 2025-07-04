/* eslint-disable @typescript-eslint/ban-ts-comment */

import { expect as errorExpect, it } from 'vitest';

import { parseSpecifier } from './specifier.js';

const expect = errorExpect.soft;

function test(input: string, expected: { name: string; version?: string; path: string }) {
  it(input, () => {
    expect(parseSpecifier(input)).deep.equal(expected);
  });
}

test('pkgName', {
  name: 'pkgName',
  version: undefined,
  path: '.',
});

test('pkgName/foo', {
  name: 'pkgName',
  version: undefined,
  path: './foo',
});

test('pkgName@beta', {
  name: 'pkgName',
  version: 'beta',
  path: '.',
});

test('pkgName@beta/foo', {
  name: 'pkgName',
  version: 'beta',
  path: './foo',
});

test('pkgName@5.4.3-beta.2', {
  name: 'pkgName',
  version: '5.4.3-beta.2',
  path: '.',
});

test('pkgName@5.4.3', {
  name: 'pkgName',
  version: '5.4.3',
  path: '.',
});

test('pkgName@5.4.3/foo', {
  name: 'pkgName',
  version: '5.4.3',
  path: './foo',
});

test('pkgName@5.4.3/foo/bar', {
  name: 'pkgName',
  version: '5.4.3',
  path: './foo/bar',
});

test('@scope/pkgName', {
  name: '@scope/pkgName',
  version: undefined,
  path: '.',
});

test('@scope/pkgName/foo', {
  name: '@scope/pkgName',
  version: undefined,
  path: './foo',
});

test('@scope/pkgName@1.0.0', {
  name: '@scope/pkgName',
  version: '1.0.0',
  path: '.',
});

test('@scope/pkgName@1.0.0/foo', {
  name: '@scope/pkgName',
  version: '1.0.0',
  path: './foo',
});

it('invalid', () => {
  // @ts-expect-error
  expect(() => parseSpecifier(undefined)).toThrow();
});
