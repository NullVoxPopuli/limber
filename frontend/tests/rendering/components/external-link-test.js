import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';

import ExternalLink from 'limber/components/external-link';

module('Integration | Component | external-link', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    this.setProperties({ ExternalLink });
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.set('myAction', function(val) { ... });

    await render(hbs`<this.ExternalLink />`);

    assert.strictEqual(this.element.textContent.trim(), '');

    // Template block usage:
    await render(hbs`
      <this.ExternalLink>
        template block text
      </this.ExternalLink>
    `);

    assert.strictEqual(this.element.textContent.trim(), 'template block text');
  });
});
