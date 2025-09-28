import { render } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';

import { ExternalLink } from '@nullvoxpopuli/limber-shared';

module('Integration | Component | external-link', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    await render(<template><ExternalLink /></template>);

    assert.dom().hasNoText();

    // Template block usage:
    await render(
      <template>
        <ExternalLink>
          template block text
        </ExternalLink>
      </template>
    );

    assert.dom().hasText('template block text');
  });
});
