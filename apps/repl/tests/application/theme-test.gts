import { click, find, visit } from '@ember/test-helpers';
import { module, test } from 'qunit';

import { colorScheme, localPreference, sync } from 'ember-primitives/color-scheme';

import { clearLocalStorage, setupApplicationCompilerTest } from '#tests/helpers.ts';

const toggle = '[data-test-theme-toggle]';

function outputBackground() {
  const output = find('[data-test-output]');

  return output && getComputedStyle(output).backgroundColor;
}

module('Theme', function (hooks) {
  setupApplicationCompilerTest(hooks);
  clearLocalStorage(hooks);

  hooks.beforeEach(function () {
    colorScheme.update('light');
  });

  hooks.afterEach(function () {
    localPreference.delete();
    sync();
  });

  test('the toggle switches the output between light and dark', async function (assert) {
    await visit('/edit?format=gjs&t=<template>hi</template>');

    assert.dom(toggle).isNotChecked();
    assert.strictEqual(outputBackground(), 'rgb(255, 255, 255)');

    await click(toggle);

    assert.dom(toggle).isChecked();
    assert.strictEqual(outputBackground(), 'rgb(28, 30, 38)');
    assert.strictEqual(document.documentElement.style.colorScheme, 'dark');
    assert.dom(document.body).hasClass('theme-dark');
    assert.strictEqual(localPreference.read(), 'dark');

    await click(toggle);

    assert.dom(toggle).isNotChecked();
    assert.strictEqual(outputBackground(), 'rgb(255, 255, 255)');
    assert.dom(document.body).hasClass('theme-light');
    assert.strictEqual(localPreference.read(), 'light');
  });
});
