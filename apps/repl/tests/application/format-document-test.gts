import { click, currentURL, visit } from '@ember/test-helpers';
import { module, test } from 'qunit';

import LZString from 'lz-string';

import { Editor } from '#edit/editor/index.gts';
import Layout from '#edit/layout/index.gts';
import { setupApplicationCompilerTest } from '#tests/helpers.ts';

import { getService } from '../helpers';
import { Page } from './-page';

const { decompressFromEncodedURIComponent } = LZString;

const button = '[data-test-format-document]';

function textInURL() {
  const search = currentURL().split('?')[1];
  const compressed = new URLSearchParams(search).get('c');

  return compressed ? decompressFromEncodedURIComponent(compressed) : null;
}

module('Editor > Format document', function (hooks) {
  setupApplicationCompilerTest(hooks);

  const page = new Page();

  test('formats gjs and updates the editor and the URL', async function (assert) {
    const messy = `const   x = {a:1}\n<template><div   class="a" >{{x.a}}</div></template>`;
    const clean = `const x = { a: 1 };\n<template>\n  <div class="a">{{x.a}}</div>\n</template>\n`;

    await page.visitEdit('gjs', messy);
    await page.editor.load();

    assert.dom(button).exists();

    await click(button);

    assert.strictEqual(
      getService('editor').text,
      clean,
      'the editor service has the formatted text'
    );
    assert.strictEqual(textInURL(), clean, 'the URL has the formatted text');
    assert.true(page.editor.hasText(clean), 'the editor shows the formatted text');
  });

  test('formats hbs', async function (assert) {
    await page.visitEdit('hbs|ember', `<div   class="a"  >{{this.foo}}   {{yield}}</div>`);
    await page.editor.load();

    await click(button);

    assert.strictEqual(getService('editor').text, `<div class="a">{{this.foo}} {{yield}}</div>`);
  });

  test('formats the code fences in glimdown', async function (assert) {
    const messy = '# Title\n\n```gjs\nconst   x = 1\n```\n';
    const clean = '# Title\n\n```gjs\nconst x = 1;\n```\n';

    await page.visitEdit('gmd', messy);
    await page.editor.load();

    await click(button);

    assert.strictEqual(getService('editor').text, clean);
  });

  test('a syntax error is shown and the text is kept', async function (assert) {
    const broken = `const x = {`;

    // Without the output pane, the broken document is not compiled,
    // so the only error comes from the formatter.
    this.owner.register(
      'template:edit',
      <template>
        <Layout>
          <:editor><Editor /></:editor>
          <:output></:output>
        </Layout>
      </template>
    );

    await page.visitEdit('gjs', broken);
    await page.editor.load();

    await click(button);

    assert.strictEqual(getService('editor').text, broken, 'the text did not change');
    assert.dom('[data-test-error]').containsText('Parse Error');
  });

  test('there is no button for a format without a formatter', async function (assert) {
    await visit(`/edit?format=mermaid&t=graph TD; A-->B`);
    await page.editor.load();

    assert.dom(button).doesNotExist();
  });
});
