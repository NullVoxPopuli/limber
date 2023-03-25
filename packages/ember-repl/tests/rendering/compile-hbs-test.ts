import { setComponentTemplate } from '@ember/component';
import templateOnly from '@ember/component/template-only';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';

import { compileHBS } from 'ember-repl';

import { Await } from '../helpers/await';

module('compileHBS()', function (hooks) {
  setupRenderingTest(hooks);

  test('it works', async function (assert) {
    assert.expect(5);

    this.setProperties({
      compile: () => {
        let template = `
          {{#each (array 1 2) as |num|}}
            <output>{{num}}</output>
          {{/each}}
        `;

        let { component, name, error } = compileHBS(template);

        assert.notOk(error);
        assert.ok(name);

        return component;
      },
    });

    await render(
      hbs`
        {{#let (this.compile) as |CustomComponent|}}
          <CustomComponent />
        {{/let}}
      `
    );

    assert.dom('output').exists({ count: 2 });
    assert.dom().containsText('1');
    assert.dom().containsText('2');
  });

  test('can render components passed to scope', async function (assert) {
    assert.expect(3);

    const SomeOtherComponent = setComponentTemplate(hbs`there!`, templateOnly());

    let template = `Hi <SomeOtherComponent />`;

    this.setProperties({
      compile: () => {
        let { component, error, name } = compileHBS(template, { scope: { SomeOtherComponent } });

        assert.notOk(error);
        assert.ok(name);

        return component;
      },
    });

    await render(hbs`
      {{#let (this.compile) as |CustomComponent|}}
        <CustomComponent />
      {{/let}}
    `);

    assert.dom().containsText('Hi there!');
  });

  module('deliberate errors', function () {
    test('syntax', async function (assert) {
      assert.expect(4);

      this.setProperties({
        await: Await,
        compile: async () => {
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
        },
      });

      await render(
        hbs`
        {{#let (this.compile) as |CustomComponent|}}
          <this.await @promise={{CustomComponent}} />
        {{/let}}
      `
      );

      assert.dom('output').exists({ count: 0 });
    });
  });
});
