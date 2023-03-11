import { module, test } from 'qunit';
import { setupTest } from 'my-app/tests/helpers';

module('Unit | Service | docs', function (hooks) {
  setupTest(hooks);

  // TODO: Replace this with your real tests.
  test('it exists', function (assert) {
    let service = this.owner.lookup('service:docs');
    assert.ok(service);
  });
});
