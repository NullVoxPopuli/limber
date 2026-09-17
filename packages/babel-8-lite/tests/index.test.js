import assert from 'node:assert/strict';
import { test } from 'node:test';

import * as babel from '@glimdown/babel-8-lite';

test('has the shape of @babel/standalone', () => {
  assert.match(babel.version, /^8\./);
  assert.equal(typeof babel.transform, 'function');
  assert.equal(typeof babel.transformAsync, 'function');
  assert.ok(babel.availablePlugins['transform-typescript']);
  assert.ok(babel.availablePresets.react);
});

test('transform is synchronous', () => {
  const result = babel.transform('const a = 1;', { filename: 'a.js' });

  assert.equal(result.code, 'const a = 1;');
});

test('strips types', async () => {
  const result = await babel.transformAsync('const a: number = 1;', {
    filename: 'a.ts',
    plugins: [babel.availablePlugins['transform-typescript']],
  });

  assert.equal(result.code, 'const a = 1;');
});

test('compiles jsx', () => {
  const result = babel.transform('export default () => <p>hi</p>;', {
    filename: 'a.jsx',
    presets: [[babel.availablePresets.react, { runtime: 'automatic', development: false }]],
  });

  assert.match(result.code, /react\/jsx-runtime/);
});
