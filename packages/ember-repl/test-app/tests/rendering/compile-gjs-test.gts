import { assert as debugAssert } from '@ember/debug';
import { render, setupOnerror } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';

import { stripIndent } from 'common-tags';
import { compile } from 'ember-repl';

import type { ComponentLike } from '@glint/template';

module('Rendering | compile()', function (hooks) {
  setupRenderingTest(hooks);

  module('format: gjs', function () {
    test('gjs with imports works', async function (assert) {
      assert.expect(1);

      setupOnerror(() => {
        assert.notOk('This should not error');
      });

      let snippet = stripIndent`
        import Component from '@glimmer/component';
        import { on } from '@ember/modifier';

        <template>
          <button {{on "click" console.log}}>Click</button>
        </template>
      `;

      let component: ComponentLike | undefined;

      await compile(snippet, {
        format: 'gjs',
        onSuccess: (comp) => (component = comp),
        onError: () => assert.notOk('did not expect error'),
        onCompileStart: () => {
          /* not used */
        },
      });

      debugAssert(`[BUG]`, component);

      await render(component);

      assert.dom('button').hasText('Click');
    });
  });
});
