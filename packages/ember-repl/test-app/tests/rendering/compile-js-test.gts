import { click, render } from '@ember/test-helpers';
import { module, skip, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';

import { compileJS } from 'ember-repl/formats/gjs';
// import this so we don't tree-shake it away
import ExampleComponent from 'ember-repl-test-app/components/example-component';

import { Await } from '../helpers/await';

module('compileJS()', function (hooks) {
  setupRenderingTest(hooks);

  test('it works', async function (assert) {
    const compile = async () => {
      const template = `
        import Component from '@glimmer/component';
        import { tracked } from '@glimmer/tracking';
        import { on } from '@ember/modifier';

        export default class MyComponent extends Component {
          @tracked value = 0;

          increment = () => this.value++;

          <template>
            <output>{{this.value}}</output>
            <button {{on "click" this.increment}}>+1</button>
          </template>
        }
      `;

      const { component, name, error } = await compileJS(template);

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

    assert.dom('output').exists();
    assert.dom('output').hasText('0');

    await click('button');
    assert.dom('output').hasText('1');

    await click('button');
    assert.dom('output').hasText('2');
  });

  /**
   * Vite apps don't use loader.js, so this isn't possible anymore
   */
  skip('can import components available to the app', async function (assert) {
    assert.ok(ExampleComponent);

    const compile = async () => {
      const template = `
        import Component from '@glimmer/component';
        import { tracked } from '@glimmer/tracking';
        import { on } from '@ember/modifier';

        import Example from 'ember-repl-test-app/components/example-component';

        <template>
          <Example />
        </template>
      `;

      const { component, name, error } = await compileJS(template);

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

    assert.dom().hasText('!!Example!!');
  });

  test('extra modules may be passed, explicitly', async function (assert) {
    const AComponent = <template>Custom extra module</template>;

    const compile = async () => {
      const template = `
        import Component from '@glimmer/component';
        import { tracked } from '@glimmer/tracking';
        import { on } from '@ember/modifier';

        import AComponent from 'my-silly-import-path/a-component';

        <template>
          <AComponent />
        </template>
      `;

      const { component, name, error } = await compileJS(template, {
        'my-silly-import-path/a-component': AComponent,
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

    assert.dom().hasText('Custom extra module');
  });
});
