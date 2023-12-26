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

  // eslint-disable-next-line qunit/require-expect
  test('visting', async function (assert) {
    assert.expect(manifest.list.flat().length);

    for (let section of manifest.list) {
      for (let chapter of section) {
        await visit(chapter.path);
        assert.strictEqual(currentURL(), chapter.path, `visited ${chapter.path}`);
      }
    }
  });

  // eslint-disable-next-line qunit/require-expect
  test('hitting next', async function (assert) {
    assert.expect(1);
    await visit('/');

    assert.strictEqual(currentURL(), manifest.first.path);

    assert.expect(manifest.list.flat().length);

    let previous = currentURL();

    while (find('[data-test-next]')) {
      await click('[data-test-next]');

      let current = currentURL();

      assert.notEqual(current, previous, `Navigated from ${previous} to ${current}`);
    }
  });
});
