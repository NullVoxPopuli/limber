import { click, currentURL, find, visit } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';

import type { Manifest } from 'tutorial/services/types';

module('every tutorial chapter is visitable', function (hooks) {
  setupApplicationTest(hooks);

  let manifest: Manifest;

  hooks.beforeEach(async function () {
    let request = await fetch('/docs/manifest.json');
    let json = await request.json();

    manifest = json;
  });

  test('Manifest is of appropriate shape', function (assert) {
    assert.ok(manifest.list);
    assert.ok(manifest.grouped);
    assert.ok(manifest.first);
  });

  test('visting', async function (assert) {
    for (let section of manifest.list) {
      for (let chapter of section) {
        await visit(chapter.path);
        assert.strictEqual(currentURL(), chapter.path, `visited ${chapter.path}`);
      }
    }
  });

  test('hitting next', async function (assert) {
    await visit('/');

    assert.strictEqual(currentURL(), manifest.first.path);

    let previous = currentURL();

    while (find('[data-test-next]')) {
      await click('[data-test-next]');

      let current = currentURL();

      assert.notEqual(current, previous, `Navigated from ${previous} to ${current}`);
    }
  });
});
