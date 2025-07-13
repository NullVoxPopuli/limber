import { module, test } from 'qunit';

import { setupTest } from 'tutorial/tests/helpers';

module('Unit | Service | docs', function (hooks) {
  setupTest(hooks);

  // TODO: Replace this with your real tests.
  test('it exists', function (assert) {
    const service = this.owner.lookup('service:docs');

    assert.ok(service);
  });
});
