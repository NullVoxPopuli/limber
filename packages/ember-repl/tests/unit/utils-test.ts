import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

import { invocationOf, nameFor } from 'ember-repl';

module('nameFor()', function () {
  function randomInRange(min: number, max: number) {
    return Math.random() * (max - min) + min;
  }

  function makeString() {
    const length = randomInRange(0, 10000);

    let result = '';
    const characters =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;

    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }

    return result;
  }

  test('it is stable', function (assert) {
    for (let i = 0; i < 20; i++) {
      const str = makeString();

      assert.strictEqual(nameFor(str), nameFor(str));
    }
  });
});

module('invocationOf()', function (hooks) {
  setupTest(hooks);

  test('it works', function (assert) {
    assert.throws(
      () => invocationOf(''),
      /You must pass a name to invocationOf. Received: ``/
    );
    assert.strictEqual(invocationOf('a'), '<A />');
    assert.strictEqual(invocationOf('a-1'), '<A1 />');
    assert.strictEqual(invocationOf('ab-1'), '<Ab1 />');
    assert.strictEqual(invocationOf('a-b-1'), '<AB1 />');
    assert.strictEqual(invocationOf('ab-b-1'), '<AbB1 />');
    assert.strictEqual(invocationOf('ab-b-1-1'), '<AbB11 />');
  });
});
