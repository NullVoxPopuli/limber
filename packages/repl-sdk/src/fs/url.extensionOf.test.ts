import { expect, it } from 'vitest';

import { extensionOf, typeFor } from './url.js';

function test(input: string, ext: string, type: string) {
  it(input, () => {
    expect(extensionOf(input)).toBe(ext);
    expect(typeFor(input)).toBe(type);
  });
}

test('file:///npm/nanoid@6.0.1/index.browser.js', 'js', 'js');
test('file:///npm/foo@1.0.0/styles.css', 'css', 'css');
test('file:///npm/foo@1.0.0/package.json', 'json', 'json');
test('file:///project/app.ts', 'ts', 'ts');
test('file:///project/component.gjs?v=3', 'gjs', 'js');
test('file:///npm/foo@1.0.0/styles.css?v=12', 'css', 'css');
test('file:///npm/foo@1.0.0/data.json?raw#top', 'json', 'json');
test('file:///npm/foo@1.0.0/theme.css#section.1', 'css', 'css');
test('file:///npm/foo@1.0.0/README', '', 'js');
test('file:///npm/foo@1.0.0/.npmrc', '', 'js');
test('https://esm.sh/foo/dist/index.mjs?target=es2022', 'mjs', 'js');
test('not a url', '', 'js');
