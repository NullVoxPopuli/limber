import { click, currentURL, find, settled, visit } from '@ember/test-helpers';
import { module, test, todo } from 'qunit';

import LZString from 'lz-string';

import { Output } from '#components/output.gts';
import { AutoRender } from '#edit/layout/controls/auto-render.gts';
import { setupApplicationCompilerTest } from '#tests/helpers.ts';

import { getService } from '../helpers';
import { Page } from './-page';

const { compressToEncodedURIComponent } = LZString;

const toggle = '[data-test-auto-render]';
const render = '[data-test-render]';
const out = '[data-test-compiled-output] [data-test-text]';

const doc = (text: string) => `<template><p data-test-text>${text}</p></template>`;

async function type(text: string) {
  getService('editor').updateText(doc(text));
  await settled();
}

module('Editor > Auto render', function (hooks) {
  setupApplicationCompilerTest(hooks);

  const page = new Page();

  hooks.beforeEach(function () {
    this.owner.lookup('service:editor').setCodemirrorState = () => {};

    this.owner.register(
      'template:edit',
      <template>
        <AutoRender />
        <Output @shadow={{false}} />
      </template>
    );
  });

  test('typing re-renders by default', async function (assert) {
    await page.visitEdit('gjs', doc('one'));

    assert.dom(out).hasText('one');
    assert.dom(render).doesNotExist();

    await type('two');

    assert.dom(out).hasText('two');
  });

  test('while paused, typing does not compile until render is clicked', async function (assert) {
    await page.visitEdit('gjs', doc('one'));
    await click(toggle);

    assert.true(currentURL().includes('autorender=off'), 'the URL has the paused state');

    const before = find(out);

    await type('two');

    assert.dom(out).hasText('one');
    assert.strictEqual(find(out), before, 'the output did not compile again');
    assert.true(currentURL().includes('autorender=off'), 'typing keeps the paused state');

    await click(render);

    assert.dom(out).hasText('two');

    await click(toggle);

    assert.false(currentURL().includes('autorender'), 'the URL no longer has the paused state');
    assert.dom(render).doesNotExist();

    await type('three');

    assert.dom(out).hasText('three');
  });

  test('render compiles again when the text did not change', async function (assert) {
    await page.visitEdit('gjs', doc('one'));
    await click(toggle);

    const before = find(out);

    await click(render);

    assert.dom(out).hasText('one');
    assert.notStrictEqual(find(out), before, 'the output compiled again');
  });

  // The render click reads the text and format from the URL, so the next edit
  // invalidates keepLatest and compiles the same text once more.
  todo('after render is clicked, typing does not compile again', async function (assert) {
    await page.visitEdit('gjs', doc('one'));
    await click(toggle);
    await type('two');
    await click(render);

    const before = find(out);

    await type('three');

    assert.dom(out).hasText('two');
    assert.strictEqual(find(out), before, 'the output did not compile again');
  });

  test('a paused page renders once on load', async function (assert) {
    await visit(`/edit?format=gjs&autorender=off&c=${compressToEncodedURIComponent(doc('one'))}`);

    assert.dom(out).hasText('one');
    assert.dom(render).exists();

    await type('two');

    assert.dom(out).hasText('one');
  });

  test('resuming renders the latest text', async function (assert) {
    await visit(`/edit?format=gjs&autorender=off&c=${compressToEncodedURIComponent(doc('one'))}`);

    await type('two');
    await click(toggle);

    assert.dom(out).hasText('two');
  });
});
