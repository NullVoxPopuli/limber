import { find, render } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';

import { Shadowed } from 'limber/components/shadowed';

module('Rendering | <Shadowed>', function (hooks) {
  setupRenderingTest(hooks);

  test('it works', async function (assert) {
    await render(
      <template>
        out of shadow

        <Shadowed>
          in shadow
        </Shadowed>
      </template>
    );

    assert.dom().hasText('out of shadow');
    assert.dom().doesNotContainText('in shadow');
    // assort.dom forgot that ShadowDom is a thing
    // assert.dom(find('[data-shadow]')?.shadowRoot).hasText('in shadow');
    assert.ok(find('[data-shadow]')?.shadowRoot?.textContent?.includes('in shadow'));
  });
});
