import { assert as debugAssert } from '@ember/debug';
import {
  click,
  render,
  settled,
  setupOnerror,
  waitUntil,
} from '@ember/test-helpers';
import QUnit, { module, skip, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';

import { stripIndent } from 'common-tags';
import { compile, getCompiler } from 'ember-repl';

import ExampleComponent from '#app/components/example-component.gts';

import { setupCompiler } from 'ember-repl/test-support';

import { Await } from '../helpers/await.gts';

import type { ComponentLike } from '@glint/template';

function unexpectedErrorHandler(error: unknown) {
  console.error(error);
  QUnit.assert.notOk(`CHECK CONSOLE: did not expect error: ${String(error)}`);
}

function errorMessagesIn(compiler: ReturnType<typeof getCompiler>) {
  return compiler.messages.filter((message) => message.type === 'error');
}

module('Rendering | compile()', function (hooks) {
  setupRenderingTest(hooks);

  module('format: gjs', function (hooks) {
    setupCompiler(hooks);

    test('gjs with imports works', async function (assert) {
      setupOnerror((e) => {
        assert.notOk(e, 'This should not error');
      });

      const compiler = getCompiler(this);

      const snippet = stripIndent`
        import Component from '@glimmer/component';
        import { on } from '@ember/modifier';

        const { console } = globalThis;

        <template>
          <button {{on "click" console.log}}>Click</button>
        </template>
      `;

      let component: ComponentLike | undefined;

      const state = compile(compiler, snippet, {
        format: 'gjs',
        onSuccess: (comp) => (component = comp),
        onError: unexpectedErrorHandler,
        onCompileStart: () => {
          /* not used */
        },
      });

      await state.promise;

      debugAssert(`[BUG]`, component);

      await render(component);

      assert.dom('button').hasText('Click');
    });

    test('parse errors are not swallowed', async function (assert) {
      const compiler = getCompiler(this);

      /**
       * The `= ;` is a syntax error, which content-tag (SWC) reports
       * with a bare "Parse Error at <file>:<line>:<column>" message —
       * the explanation and code frame are on the error's `source_code` property.
       */
      const snippet = stripIndent`
        const isBroken = ;

        <template>{{isBroken}}</template>
      `;

      /**
       * Mirroring how apps use compile(): nobody awaits state.promise,
       * so its rejection also fires the browser's unhandledrejection event,
       * whose announcement is the *last* error message -- the one the UI's
       * error bubble ends up showing.
       *
       * QUnit fails tests on unhandled rejections; that unhandled rejection
       * is the point of this test, so silence QUnit's handler for its duration.
       */
      const onUncaughtException = QUnit.onUncaughtException;

      QUnit.onUncaughtException = () => {};

      try {
        let reported: string | undefined;

        const state = compile(compiler, snippet, {
          format: 'gjs',
          onError: (error) => (reported = error),
        });

        await waitUntil(() => state.error, { timeout: 10_000 });

        // Wait for the unhandledrejection announcement
        // (the compile() announcement is first, this one is second)
        await waitUntil(() => errorMessagesIn(compiler).length >= 2, {
          timeout: 10_000,
        });

        assert.ok(state.error, 'the compile state has an error');

        for (const [name, message] of [
          ['state.reason', state.reason],
          ['onError', reported],
          [
            'the UI error bubble (via compiler.lastError)',
            compiler.lastError?.message,
          ],
        ] as const) {
          assert.true(
            message?.includes('Parse Error at'),
            `${name} says where the parse error is`
          );
          assert.true(
            message?.includes('Expression expected'),
            `${name} explains what the parse error is`
          );
          assert.true(
            message?.includes('const isBroken = ;'),
            `${name} includes the code frame`
          );
        }
      } finally {
        QUnit.onUncaughtException = onUncaughtException;
      }
    });

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
        const compiler = getCompiler(this);

        const { component, name, error } = await compiler.compileGJS(template);

        assert.notOk(error);
        assert.ok(name);

        return component;
      };

      void render(
        <template>
          {{#let (compile) as |promise|}}
            <Await @promise={{promise}} />
          {{/let}}
        </template>
      );

      await settled();

      assert.dom('output').exists('output element exists');
      assert.dom('output').hasText('0', 'output has text: 0');

      await click('button');
      assert.dom('output').hasText('1', 'output has text: 1');

      await click('button');
      assert.dom('output').hasText('2', 'output has text: 2');
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

        const compiler = getCompiler(this);
        const { component, name, error } = await compiler.compileGJS(template);

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
  });

  module('format: gjs (custom scope)', function (hooks) {
    const AComponent = <template>Custom extra module</template>;

    setupCompiler(hooks, {
      modules: {
        'my-silly-import-path/a-component': () => ({ default: AComponent }),
      },
    });

    test('extra modules may be passed, explicitly', async function (assert) {
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

        const compiler = getCompiler(this);

        const { component, name, error } = await compiler.compileGJS(template);

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
});
