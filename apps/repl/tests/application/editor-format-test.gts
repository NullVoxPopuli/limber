import { currentURL, settled, visit } from '@ember/test-helpers';
import { module, test } from 'qunit';

import { Editor } from '#edit/editor/index.gts';
import { setupApplicationCompilerTest } from '#tests/helpers.ts';

import { Page } from './-page';

module('Editor > Format', function (hooks) {
  setupApplicationCompilerTest(hooks);

  const page = new Page();
  const defaultText = '<template>hi</template>';

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
    await page.expectRedirectToContent('/edit', {
      format: 'gmd',
    });

    await page.editor.load();

    assert.strictEqual(page.editor.format, 'gmd');
  });

  test('when choosing a format, text is required -- otherwise glimdown is chosen', async function (assert) {
    await page.expectRedirectToContent('/edit?format=gjs', {
      format: 'gmd',
    });

    await page.editor.load();
    assert.strictEqual(page.editor.format, 'gmd');
  });

  test('can start with a different text', async function (assert) {
    await visit(`/edit?format=gjs&t=${defaultText}`);
    await page.editor.load();

    assert.strictEqual(page.editor.format, 'gjs');
    assert.true(page.editor.hasText('hi'), 'has passed text as well');
  });

  test('after selecting text, it loads again when visiting /', async function (assert) {
    await visit(`/edit?format=gjs&t=${defaultText}&nohighlight=1`);
    await page.editor.load();

    assert.strictEqual(page.editor.format, 'gjs');
    assert.true(page.editor.hasText('hi'), 'has passed text as well');

    // there is no /application route
    await page.expectRedirectToContent(`application`);
    assert.strictEqual(currentURL(), 'application', 'URL is left alone for debugging');
    assert.dom().containsText('ope!');
  });

  test('can start with glimdown, and change to gjs', async function (assert) {
    await page.expectRedirectToContent(`/edit`, {
      format: 'gmd',
    });
    await page.editor.load();

    assert.strictEqual(page.editor.format, 'gmd');

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    this.owner.lookup('service:editor').updateDemo(defaultText, { format: 'gjs' });
    await settled();

    assert.strictEqual(page.editor.format, 'gjs');
  });

  test('can start with glimdown, and is able to change formats via the URL', async function (assert) {
    await page.expectRedirectToContent(`/edit`, {
      format: 'gmd',
    });
    await page.editor.load();

    assert.strictEqual(page.editor.format, 'gmd');

    await visit(`/edit?format=gjs&t=${defaultText}`);

    assert.strictEqual(page.editor.format, 'gjs');
  });
});
