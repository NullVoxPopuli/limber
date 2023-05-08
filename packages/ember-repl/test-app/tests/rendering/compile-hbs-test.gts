import { render } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';

import { compileHBS } from 'ember-repl';

import { Await } from '../helpers/await';

module('compileHBS()', function (hooks) {
  setupRenderingTest(hooks);

  test('it works', async function (assert) {
    assert.expect(5);

    let compile = () => {
      let template = `
        {{#each (array 1 2) as |num|}}
          <output>{{num}}</output>
        {{/each}}
      `;

      let { component, name, error } = compileHBS(template);

      assert.notOk(error);
      assert.ok(name);

      return component;
    };

    await render(<template>
      {{#let (compile) as |CustomComponent|}}
        <CustomComponent />
      {{/let}}
    </template>);

    assert.dom('output').exists({ count: 2 });
    assert.dom().containsText('1');
    assert.dom().containsText('2');
  });

  test('can render components passed to scope', async function (assert) {
    assert.expect(3);

    const SomeOtherComponent = <template>there!</template>;

    let template = `Hi <SomeOtherComponent />`;

    let compile = () => {
      let { component, error, name } = compileHBS(template, {
        scope: { SomeOtherComponent },
      });

      assert.notOk(error);
      assert.ok(name);

      return component;
    };

    await render(<template>
      {{#let (compile) as |CustomComponent|}}
        <CustomComponent />
      {{/let}}
    </template>);

    assert.dom().containsText('Hi there!');
  });

  module('deliberate errors', function () {
    test('syntax', async function (assert) {
      assert.expect(4);

      let compile = async () => {
        // What else do we await to convert this to promise?
        await Promise.resolve();

        let template = `
          {{#each array 1 2) as |num|}}
            <output>{{num}}</output>
          {{/each}}
        `;

        let { component, name, error } = compileHBS(template);

        assert.ok(error);
        assert.ok(name);
        assert.notOk(component);

        return component;
      };

      await render(<template>
        {{#let (compile) as |CustomComponent|}}
          <Await @promise={{CustomComponent}} />
        {{/let}}
      </template>);

      assert.dom('output').exists({ count: 0 });
    });
  });
});
