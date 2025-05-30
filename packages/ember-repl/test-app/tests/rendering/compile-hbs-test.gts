import { render } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';

import { getCompiler } from 'ember-repl';

import { setupCompiler } from 'ember-repl/test-support';

import { Await } from '../helpers/await';

module('compileHBS()', function (hooks) {
  setupRenderingTest(hooks);
  setupCompiler(hooks);

  test('it works', async function (assert) {
    const compile = async () => {
      const template = `
        {{#each (array 1 2) as |num|}}
          <output>{{num}}</output>
        {{/each}}
      `;

      const compiler = getCompiler(this);

      const { component, name, error } = await compiler.compileHBS(template);

      assert.notOk(error);
      assert.ok(name);

      return component;
    };

    await render(
      <template>
        {{#let (compile) as |CustomComponent|}}
          <Await @promise={{CustomComponent}} />
        {{/let}}
      </template>
    );

    assert.dom('output').exists({ count: 2 });
    assert.dom().containsText('1');
    assert.dom().containsText('2');
  });

  test('can render components passed to scope', async function (assert) {
    const SomeOtherComponent = <template>there!</template>;

    const template = `Hi <SomeOtherComponent />`;

    const compile = async () => {
      const compiler = getCompiler(this);
      const { component, error, name } = await compiler.compileHBS(template, {
        scope: { SomeOtherComponent },
      });

      assert.notOk(error);
      assert.ok(name);

      return component;
    };

    await render(
      <template>
        {{#let (compile) as |CustomComponent|}}
          <Await @promise={{CustomComponent}} />
        {{/let}}
      </template>
    );

    assert.dom().hasText('Hi there!');
  });

  module('deliberate errors', function () {
    test('syntax', async function (assert) {
      const compile = async () => {
        const template = `
          {{#each array 1 2) as |num|}}
            <output>{{num}}</output>
          {{/each}}
        `;

        const compiler = getCompiler(this);
        const { component, error, name } = await compiler.compileHBS(template);

        assert.ok(error);
        assert.ok(name);
        assert.notOk(component);

        return component;
      };

      await render(
        <template>
          {{#let (compile) as |promise|}}
            <Await @promise={{promise}} />
          {{/let}}
        </template>
      );

      assert.dom('output').exists({ count: 0 });
    });
  });
});
