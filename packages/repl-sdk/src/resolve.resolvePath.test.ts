import { expect as errorExpect, it } from 'vitest';

const expect = errorExpect.soft;

import { resolvePath } from './resolve.js';

function test({ from, to, expected }: { from: string; to: string; expected: string }) {
  it(`import ${to} from ${from}`, () => {
    expect(resolvePath(from, to)).deep.equal(expected);
  });
}

test({ from: '@scope/pkgName', to: 'index.js', expected: '@scope/pkgName/index.js' });
test({ from: '@scope/pkgName/index.js', to: './foo.js', expected: '@scope/pkgName/foo.js' });
test({
  from: '@scope/pkgName/folder/index.js',
  to: './foo.js',
  expected: '@scope/pkgName/folder/foo.js',
});
test({
  from: '@scope/pkgName/folder/index.js',
  to: '../foo.js',
  expected: '@scope/pkgName/foo.js',
});
