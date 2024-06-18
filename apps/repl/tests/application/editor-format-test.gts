import { settled, visit } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';

import { Editor } from 'limber/components/limber/editor';

import { Page } from './-page';

module('Editor > Format', function (hooks) {
  setupApplicationTest(hooks);

  let page = new Page();
  let defaultText = '<template>hi</template>';

  hooks.beforeEach(function () {
    this.owner.register(
      'template:edit',
      <template>
        <div data-test-editor-panel>
          <Editor />
        </div>
      </template>
    );
  });

  test('defaults to glimdown', async function (assert) {
    await visit('/edit');
    await page.editor.load();

    assert.strictEqual(page.editor.format, 'glimdown');
  });

  test('when choosing a format, text is required -- otherwise glimdown is chosen', async function (assert) {
    await visit('/edit?format=gjs');
    await page.editor.load();

    assert.strictEqual(page.editor.format, 'glimdown');
  });

  test('can start with a different text', async function (assert) {
    await visit(`/edit?format=gjs&t=${defaultText}`);
    await page.editor.load();

    assert.strictEqual(page.editor.format, 'gjs');
    assert.true(page.editor.hasText('hi'), 'has passed text as well');
  });

  test('can start with glimdown, and change to gjs', async function (assert) {
    await visit('/edit');
    await page.editor.load();

    assert.strictEqual(page.editor.format, 'glimdown');

    this.owner.lookup('service:editor').updateDemo(defaultText, 'gjs');
    await settled();

    assert.strictEqual(page.editor.format, 'gjs');
  });

  test('can start with glimdown, and is unable to change formats via the URL (must be done via postMessage or via service)', async function (assert) {
    await visit('/edit');
    await page.editor.load();

    assert.strictEqual(page.editor.format, 'glimdown');

    await visit(`/edit?format=gjs&t=${defaultText}`);

    assert.strictEqual(page.editor.format, 'glimdown');
  });
});
