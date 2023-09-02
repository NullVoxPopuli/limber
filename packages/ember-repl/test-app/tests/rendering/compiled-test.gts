import { renderSettled } from '@ember/renderer';
import { render, settled } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';

import { stripIndent } from 'common-tags';
import { Compiled } from 'ember-repl';

module('Rendering | Compiled()', function (hooks) {
  setupRenderingTest(hooks);

  test('it works', async function (assert) {
    let doc = stripIndent`
      hello there
    `;

    render(<template>
      {{#let (Compiled doc) as |state|}}
        <div id="ready">{{state.isReady}}</div>
        <div id="error">{{state.error}}</div>
        <div id="component">
          {{#if state.component}}
            <state.component />
          {{/if}}
        </div>
      {{/let}}
    </template>);

    await renderSettled();
    assert.dom('#ready').hasText('false');
    assert.dom('#error').hasNoText();
    assert.dom('#component').hasNoText();

    await settled();
    assert.dom('#ready').hasText('true');
    assert.dom('#error').hasNoText();
    assert.dom('#component').hasText('hello there');
  });
});
