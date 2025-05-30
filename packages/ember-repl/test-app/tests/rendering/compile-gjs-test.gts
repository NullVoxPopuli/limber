import { assert as debugAssert } from '@ember/debug';
import { render, setupOnerror } from '@ember/test-helpers';
import QUnit, { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';

import { stripIndent } from 'common-tags';
import { compile, getCompiler } from 'ember-repl';

import { setupCompiler } from 'ember-repl/test-support';

import type { ComponentLike } from '@glint/template';

function unexpectedErrorHandler(error: unknown) {
  console.error(error);
  QUnit.assert.notOk(`CHECK CONSOLE: did not expect error: ${String(error)}`);
}

module('Rendering | compile()', function (hooks) {
  setupRenderingTest(hooks);
  setupCompiler(hooks);

  module('format: gjs', function () {
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
  });
});
