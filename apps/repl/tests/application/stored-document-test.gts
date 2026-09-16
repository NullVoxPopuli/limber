import { currentURL, settled } from '@ember/test-helpers';
import { module, test } from 'qunit';

import { clearLocalStorage, getService, setupApplicationCompilerTest } from '#tests/helpers.ts';

import { Page } from './-page';

/**
 * A page refresh is a fresh app with an empty router,
 * so the restore tests seed localStorage and then visit /edit once.
 */
module('Editor > Stored document', function (hooks) {
  setupApplicationCompilerTest(hooks);
  clearLocalStorage(hooks);

  const page = new Page();
  const text = '<template>hi</template>';

  function formatInURL() {
    return new URLSearchParams(currentURL().split('?')[1]).get('format');
  }

  test('an edit stores the format and the document', async function (assert) {
    await page.visitEdit('gjs', text);
    await page.editor.load();

    getService('editor').update(text, 'gjs');
    await settled();

    assert.strictEqual(localStorage.getItem('active-format'), 'gjs');
    assert.strictEqual(localStorage.getItem('gjs-doc'), text);
  });

  test('the stored document comes back on a bare /edit visit', async function (assert) {
    localStorage.setItem('active-format', 'gjs');
    localStorage.setItem('gjs-doc', text);

    await page.expectRedirectToContent('/edit', { format: 'gjs', c: text });
    assert.strictEqual(formatInURL(), 'gjs');
  });

  test('a format with a flavor comes back', async function (assert) {
    localStorage.setItem('active-format', 'hbs|ember');
    localStorage.setItem('hbs|ember-doc', '<div>hi</div>');

    await page.expectRedirectToContent('/edit', { format: 'hbs|ember', c: '<div>hi</div>' });
    assert.strictEqual(formatInURL(), 'hbs|ember');
  });

  test('the storage key written by earlier versions still works', async function (assert) {
    localStorage.setItem('active-format', 'gjs-doc');
    localStorage.setItem('gjs-doc', text);

    await page.expectRedirectToContent('/edit', { format: 'gjs', c: text });
    assert.strictEqual(formatInURL(), 'gjs');
  });
});
