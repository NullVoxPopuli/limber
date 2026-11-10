import { click, currentURL, fillIn, findAll, visit } from '@ember/test-helpers';
import { module, test } from 'qunit';

import LZString from 'lz-string';

import { Output } from '#components/output.gts';
import { Dependencies } from '#edit/dependencies.gts';
import { setupApplicationCompilerTest } from '#tests/helpers.ts';

const { compressToEncodedURIComponent } = LZString;

const open = '[data-dependencies-button]';
const name = '[data-test-dependency-name]';
const version = '[data-test-dependency-version]';
const apply = '[data-test-apply-dependencies]';
const out = '[data-test-compiled-output] [data-test-text]';

/**
 * dompurify has no dependencies and says which version loaded.
 */
const doc = `
import DOMPurify from 'dompurify';

<template><p data-test-text>{{DOMPurify.version}}</p></template>
`;

function visitWith(deps?: string) {
  const qps = new URLSearchParams({ format: 'gjs', c: compressToEncodedURIComponent(doc) });

  if (deps) qps.set('deps', deps);

  return visit(`/edit?${qps.toString()}`);
}

module('Editor > Dependencies', function (hooks) {
  setupApplicationCompilerTest(hooks);

  hooks.beforeEach(function () {
    this.owner.lookup('service:editor').setCodemirrorState = () => {};

    this.owner.register(
      'template:edit',
      <template>
        <Dependencies />
        <Output @shadow={{false}} />
      </template>
    );
  });

  test('the deps query param pins the version', async function (assert) {
    await visitWith('dompurify@3.2.0');

    assert.dom(out).hasText('3.2.0');
  });

  test('the dialog shows the pins from the URL', async function (assert) {
    await visitWith('dompurify@3.2.0');
    await click(open);

    assert.dom(name).hasValue('dompurify');
    assert.dom(version).hasValue('3.2.0');
  });

  test('applying a new version compiles against it', async function (assert) {
    await visitWith('dompurify@3.2.0');
    await click(open);
    await fillIn(version, '3.1.0');
    await click(apply);

    assert.true(
      currentURL().includes(`deps=${encodeURIComponent('dompurify@3.1.0')}`),
      'the URL has the new pin'
    );
    assert.dom(out).hasText('3.1.0');
  });

  test('a package can be added and removed', async function (assert) {
    await visitWith();
    await click(open);

    assert.strictEqual(findAll(name).length, 1, 'an empty row is ready');

    await fillIn(name, 'dompurify');
    await fillIn(version, '3.1.0');
    await click('[data-test-add-dependency]');

    assert.strictEqual(findAll(name).length, 2);

    await click(apply);

    assert.dom(out).hasText('3.1.0');

    await click(open);
    await click('[data-test-remove-dependency]');
    await click(apply);

    assert.false(currentURL().includes('deps='), 'no pins leaves no query param');
  });
});
