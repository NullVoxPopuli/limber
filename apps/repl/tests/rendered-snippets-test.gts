import { click, fillIn, render } from '@ember/test-helpers';
import { module, skip, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';

import { compile as compileAnything, getCompiler } from 'ember-repl';

import { importMap } from 'limber/routes/import-map';
import { getFromLabel } from 'limber/snippets';

import { setupCompiler } from 'ember-repl/test-support';

import type { ComponentLike } from '@glint/template';
import type QUnit from 'qunit';

module('Rendered Snippets / Demos', function (hooks) {
  setupRenderingTest(hooks);
  setupCompiler(hooks, {
    modules: {
      ...importMap,
    },
  });

  async function compile(context: object, text: string, { assert }: { assert: QUnit['assert'] }) {
    let component: ComponentLike | undefined;
    let error: string | undefined;

    const state = compileAnything(getCompiler(context), text, {
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

    await state.promise;

    return { Component: component, error };
  }

  module('Welcome', function () {
    test('it renders', async function (assert) {
      const text = await getFromLabel('Welcome');
      const { Component, error } = await compile(this, text, { assert });

      assert.ok(Component, 'component rendered');
      assert.notOk(error, 'no error, because compilation was success');

      await render(<template><Component /></template>);
      assert.verifySteps(['start compile', 'compiled']);

      assert.dom('li').exists({ count: 3 });
      assert.dom('a').exists({ count: 3 });
    });
  });

  module('With inline Javascript', function (hooks) {
    let TheComponent: ComponentLike<unknown> | undefined;

    hooks.beforeEach(async function (assert) {
      const text = await getFromLabel('With inline Javascript');
      const { Component, error } = await compile(this, text, { assert });

      assert.ok(Component, 'component rendered');
      assert.notOk(error, 'no error, because compilation was success');

      TheComponent = Component;
    });

    test('it renders', async function (assert) {
      await render(<template><TheComponent /></template>);
      assert.verifySteps(['start compile', 'compiled']);

      assert.dom().containsText('Hello, Glimmer!');
      assert.dom('button').exists();
    });

    test('correct behavior', async function (assert) {
      await render(<template><TheComponent /></template>);
      assert.verifySteps(['start compile', 'compiled']);

      const output = '.glimdown-render p';

      assert.dom(output).containsText('You have clicked the button 0 times.');

      await click('button');
      assert.dom(output).containsText('You have clicked the button 1 times.');

      await click('button');
      assert.dom(output).containsText('You have clicked the button 2 times.');
    });
  });

  module('With inline Templates', function () {
    test('it renders', async function (assert) {
      const text = await getFromLabel('With inline Templates');
      const { Component, error } = await compile(this, text, { assert });

      assert.ok(Component, 'component rendered');
      assert.notOk(error, 'no error, because compilation was success');

      await render(<template><Component /></template>);
      assert.verifySteps(['start compile', 'compiled']);

      assert.dom('a').exists({ count: 3 });
    });
  });

  module('Styleguide Demo', function () {
    test('it renders', async function (assert) {
      const text = await getFromLabel('Styleguide Demo');
      const { Component, error } = await compile(this, text, { assert });

      assert.ok(Component, 'component rendered');
      assert.notOk(error, 'no error, because compilation was success');

      await render(<template><Component /></template>);
      assert.verifySteps(['start compile', 'compiled']);

      assert.dom('h2').exists({ count: 4 });
    });
  });

  module('Build your own REPL', function () {
    test('it renders', async function (assert) {
      const text = await getFromLabel('Styleguide Demo');
      const { Component, error } = await compile(this, text, { assert });

      assert.ok(Component, 'component rendered');
      assert.notOk(error, 'no error, because compilation was success');

      await render(<template><Component /></template>);
      assert.verifySteps(['start compile', 'compiled']);

      assert.dom('h2').exists({ count: 4 });
    });
  });

  module('Menu with focus trap', function () {
    test('it works', async function (assert) {
      const text = await getFromLabel('Menu with focus trap');
      const { Component, error } = await compile(this, text, { assert });

      assert.ok(Component, 'component rendered');
      assert.notOk(error, 'no error, because compilation was success');

      await render(<template><Component /></template>);
      assert.verifySteps(['start compile', 'compiled']);

      assert.dom('.glimdown-render button').exists({ count: 1 });

      await click('button');
      assert.dom('.glimdown-render button').exists({ count: 4 });
    });
  });

  module('Forms', function () {
    test('it works', async function (assert) {
      const text = await getFromLabel('Forms');
      const { Component, error } = await compile(this, text, { assert });

      assert.ok(Component, 'component rendered');
      assert.notOk(error, 'no error, because compilation was success');

      await render(<template><Component /></template>);
      assert.verifySteps(['start compile', 'compiled']);

      assert.dom('pre').doesNotContainText('the value');

      await fillIn('input[name="firstName"]', 'the value');

      assert.dom('pre').containsText('the value');
    });
  });

  module('RemoteData', function () {
    // Bug in RemoteData
    skip('it works', async function (assert) {
      const text = await getFromLabel('RemoteData');
      const { Component, error } = await compile(this, text, { assert });

      assert.ok(Component, 'component rendered');
      assert.notOk(error, 'no error, because compilation was success');

      await render(<template><Component /></template>);
      assert.verifySteps(['start compile', 'compiled']);

      assert.dom().containsText('Mace Windu');

      await fillIn('input[type="number"]', '52');

      assert.dom().doesNotContainText('Mace Windu');
    });
  });
});
