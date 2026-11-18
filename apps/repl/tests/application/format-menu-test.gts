import { click, findAll, waitUntil } from '@ember/test-helpers';
import QUnit, { module, test } from 'qunit';

import { getCompiler } from 'ember-repl';

import { clearLocalStorage, getService, setupApplicationCompilerTest } from '#tests/helpers.ts';

import { DEFAULT_GJS, getFromLabel } from 'limber/snippets';
import { fileFromParams } from 'limber/utils/messaging';

import { Page } from './-page';

module('Editor > Format menu', function (hooks) {
  setupApplicationCompilerTest(hooks);
  clearLocalStorage(hooks);

  const page = new Page();
  const custom = `const greeting = 'hi';\n\n<template>{{greeting}}</template>`;

  function currentFile() {
    return fileFromParams(getService('router').currentRoute?.queryParams ?? {});
  }

  async function choose(name: string) {
    await click('[title="Change document language"]');

    const item = findAll('.menu-item').find((element) => element.textContent?.trim() === name);

    if (!item) throw new Error(`No menu item named ${name}`);

    await click(item);
    await waitUntil(() => currentFile().format === name.toLowerCase(), { timeout: 5_000 });
  }

  for (const name of ['Svelte', 'Mermaid']) {
    test(`choosing ${name} loads the ${name} sample`, async function (assert) {
      await page.visitEdit('gjs', DEFAULT_GJS);
      await page.editor.load();
      await choose(name);

      const file = currentFile();
      const sample = await getFromLabel(name);

      assert.strictEqual(file.format, name.toLowerCase());
      assert.strictEqual(file.text, sample);
      assert.strictEqual(page.editor.format, name.toLowerCase());
      assert.true(page.editor.hasText(sample), 'the editor shows the sample');
    });
  }

  test('choosing a format loads what was last written in it', async function (assert) {
    localStorage.setItem('svelte-doc', '<p>mine</p>');

    await page.visitEdit('gjs', DEFAULT_GJS);
    await choose('Svelte');

    assert.strictEqual(currentFile().text, '<p>mine</p>');
  });

  test('choosing a format keeps text that was written by hand', async function (this: object, assert) {
    /**
     * The gjs text does not compile as svelte, and nobody awaits the failed compile.
     */
    const onUncaughtException = QUnit.onUncaughtException;

    QUnit.onUncaughtException = () => {};

    try {
      await page.visitEdit('gjs', custom);
      await page.editor.load();
      await choose('Svelte');

      assert.strictEqual(currentFile().format, 'svelte');
      assert.strictEqual(currentFile().text, custom);
      assert.strictEqual(page.editor.format, 'svelte');
      assert.true(page.editor.hasText(custom), 'the editor keeps the text');

      await waitUntil(() => getCompiler(this).lastError, { timeout: 30_000 });
    } finally {
      QUnit.onUncaughtException = onUncaughtException;
    }
  });
});
