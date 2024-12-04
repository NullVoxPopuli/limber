import { renderSettled } from '@ember/renderer';
import { render, settled } from '@ember/test-helpers';
import QUnit, { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';

import { stripIndent } from 'common-tags';
import { Compiled } from 'ember-repl';

const { assert } = QUnit;
const { Boolean } = globalThis;

module('Rendering | Compiled()', function (hooks) {
  setupRenderingTest(hooks);

  async function renderTest(doc, options = {}) {
    render(
      <template>
        {{#let (Compiled doc options) as |state|}}
          <div id="ready">{{state.isReady}}</div>
          <div id="error">{{state.error}}</div>
          <div id="component" data-test-component={{Boolean state.component}}>
            {{#if state.component}}
              <state.component />
            {{/if}}
          </div>
        {{/let}}
      </template>
    );

    await renderSettled();
  }

  function assertInitial() {
    assert.dom('#ready').hasText('false');
    assert.dom('#error').hasNoText();
    assert.dom('#component').hasNoText();
  }

  function assertDone() {
    assert.dom('#ready').hasText('true');
    assert.dom('#error').hasNoText();
    assert.dom('#component').hasAttribute('data-test-component');
  }

  test('it works', async function (assert) {
    let doc = stripIndent`
      hello there
    `;

    await renderTest(doc);
    assertInitial();

    await settled();
    assertDone();
    assert.dom('#component').hasText('hello there');
  });

  module('importMap', function () {
    test('can pass promise functions to expand scope', async function (assert) {
      let doc = stripIndent`
        import { two } from 'fake-module';

        <template>
          <output>{{two}}</output>
        </template>
      `;

      let options = {
        format: 'gjs',
        importMap: {
          'fake-module': () => {
            return {
              two: 2,
            };
          },
        },
      };

      await renderTest(doc, options);
      assertInitial();

      await settled();
      assertDone();
      assert.dom('output').hasText('2');
    });
  });
});
