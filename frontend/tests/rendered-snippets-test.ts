import { click, fillIn, render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { module, skip, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';

import {
  CACHE,
  compileTopLevelComponent,
} from 'limber/components/limber/output/compiler/create-top-level-component';
import { getFromLabel } from 'limber/snippets';

import type { ComponentLike } from '@glint/template';

module('Rendered Snippets / Demos', function (hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function () {
    CACHE.clear();
  });

  async function compile(text: string, { assert }: { assert: Assert }) {
    let component!: ComponentLike | undefined;
    let error!: string | undefined;

    await compileTopLevelComponent(text, {
      format: 'glimdown',
      onCompileStart: async () => assert.step('start compile'),
      onSuccess: async (compiled) => {
        component = compiled;
        assert.step('compiled');
      },
      onError: async (err) => {
        error = err;
        assert.step('error');
      },
    });

    return { component, error };
  }

  module('Welcome', function () {
    test('it renders', async function (assert) {
      let text = await getFromLabel('Welcome');
      let { component, error } = await compile(text, { assert });

      assert.ok(component, 'component rendered');
      assert.notOk(error, 'no error, because compilation was success');

      this.setProperties({ component });

      await render(hbs`<this.component />`);
      assert.verifySteps(['start compile', 'compiled']);

      assert.dom('li').exists({ count: 3 });
      assert.dom('a').exists({ count: 3 });
    });
  });

  module('With inline Javascript', function (hooks) {
    hooks.beforeEach(async function (assert) {
      let text = await getFromLabel('With inline Javascript');
      let { component, error } = await compile(text, { assert });

      assert.ok(component, 'component rendered');
      assert.notOk(error, 'no error, because compilation was success');

      this.setProperties({ component });
    });

    test('it renders', async function (assert) {
      await render(hbs`<this.component />`);
      assert.verifySteps(['start compile', 'compiled']);

      assert.dom().containsText('Hello, Glimmer!');
      assert.dom('button').exists();
    });

    test('correct behavior', async function (assert) {
      await render(hbs`<this.component />`);
      assert.verifySteps(['start compile', 'compiled']);

      let output = '.glimdown-render p';

      assert.dom(output).containsText('You have clicked the button 0 times.');

      await click('button');
      assert.dom(output).containsText('You have clicked the button 1 times.');

      await click('button');
      assert.dom(output).containsText('You have clicked the button 2 times.');
    });
  });

  module('With inline Templates', function () {
    test('it renders', async function (assert) {
      let text = await getFromLabel('With inline Templates');
      let { component, error } = await compile(text, { assert });

      assert.ok(component, 'component rendered');
      assert.notOk(error, 'no error, because compilation was success');

      this.setProperties({ component });

      await render(hbs`<this.component />`);
      assert.verifySteps(['start compile', 'compiled']);

      assert.dom('a').exists({ count: 3 });
    });
  });

  module('Styleguide Demo', function () {
    test('it renders', async function (assert) {
      let text = await getFromLabel('Styleguide Demo');
      let { component, error } = await compile(text, { assert });

      assert.ok(component, 'component rendered');
      assert.notOk(error, 'no error, because compilation was success');

      this.setProperties({ component });

      await render(hbs`<this.component />`);
      assert.verifySteps(['start compile', 'compiled']);

      assert.dom('h2').exists({ count: 4 });
    });
  });

  module('Build your own REPL', function () {
    test('it renders', async function (assert) {
      let text = await getFromLabel('Styleguide Demo');
      let { component, error } = await compile(text, { assert });

      assert.ok(component, 'component rendered');
      assert.notOk(error, 'no error, because compilation was success');

      this.setProperties({ component });

      await render(hbs`<this.component />`);
      assert.verifySteps(['start compile', 'compiled']);

      assert.dom('h2').exists({ count: 4 });
    });
  });

  module('Menu with focus trap', function () {
    test('it works', async function (assert) {
      let text = await getFromLabel('Menu with focus trap');
      let { component, error } = await compile(text, { assert });

      assert.ok(component, 'component rendered');
      assert.notOk(error, 'no error, because compilation was success');

      this.setProperties({ component });

      await render(hbs`<this.component />`);
      assert.verifySteps(['start compile', 'compiled']);

      assert.dom('.glimdown-render button').exists({ count: 1 });

      await click('button');
      assert.dom('.glimdown-render button').exists({ count: 4 });
    });
  });

  module('Forms', function () {
    test('it works', async function (assert) {
      let text = await getFromLabel('Forms');
      let { component, error } = await compile(text, { assert });

      assert.ok(component, 'component rendered');
      assert.notOk(error, 'no error, because compilation was success');

      this.setProperties({ component });

      await render(hbs`<this.component />`);
      assert.verifySteps(['start compile', 'compiled']);

      assert.dom('pre').doesNotContainText('the value');

      await fillIn('input[name="firstName"]', 'the value');

      assert.dom('pre').containsText('the value');
    });
  });

  module('RemoteData', function () {
    // Bug in RemoteData
    skip('it works', async function (assert) {
      let text = await getFromLabel('RemoteData');
      let { component, error } = await compile(text, { assert });

      assert.ok(component, 'component rendered');
      assert.notOk(error, 'no error, because compilation was success');

      this.setProperties({ component });

      await render(hbs`<this.component />`);
      assert.verifySteps(['start compile', 'compiled']);

      assert.dom().containsText('Mace Windu');

      await fillIn('input[type="number"]', '52');

      assert.dom().doesNotContainText('Mace Windu');
    });
  });
});
