import { module, test } from 'qunit';

import { proxyToSkypack } from 'ember-repl/esm';

module('proxyToSkypack()', function () {
  test('it prepends the CDN URL', function (assert) {
    assert.strictEqual(
      proxyToSkypack(
        `import { trackedFunction } from 'ember-resources';\n` +
          `import { compileJS } from 'ember-repl';`
      ),
      `import { trackedFunction } from 'https://cdn.skypack.dev/ember-resources';\n` +
        `import { compileJS } from 'https://cdn.skypack.dev/ember-repl';`
    );
  });
});
