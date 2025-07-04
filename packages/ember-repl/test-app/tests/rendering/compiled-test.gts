import { renderSettled } from '@ember/renderer';
import { render, settled } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';

import { stripIndent } from 'common-tags';
import { Compiled } from 'ember-repl';

import { setupCompiler } from 'ember-repl/test-support';

module('Rendering | Compiled()', function (hooks) {
  setupRenderingTest(hooks);
  setupCompiler(hooks);

  test('it works', async function (assert) {
    const doc = stripIndent`
      hello there
    `;

    void render(
      <template>
        {{#let (Compiled doc) as |state|}}
          <div id="ready">{{state.isReady}}</div>
          <div id="error">{{if state.error (String state.error) ""}}</div>
          <div id="component">
            {{#if state.component}}
              <state.component />
            {{else}}
              component is missing
              {{log "DEBUG: component is missing" state state.component}}
            {{/if}}
          </div>
        {{/let}}
      </template>
    );

    await renderSettled();
    assert.dom('#ready').hasText('false');
    assert.dom('#error').hasNoText();
    assert.dom('#component').hasText('component is missing');

    await settled();
    assert.dom('#ready').hasText('true');
    assert.dom('#error').hasNoText();
    assert.dom('#component').hasText('hello there');
  });
});
