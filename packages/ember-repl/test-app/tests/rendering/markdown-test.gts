import { assert as debugAssert } from '@ember/debug';
import { render, setupOnerror } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';

import { stripIndent } from 'common-tags';
import { compile } from 'ember-repl';

import type { ComponentLike } from '@glint/template';

module('Rendering | compile()', function (hooks) {
  setupRenderingTest(hooks);

  module('markdown features', function () {
    test('tables', async function (assert) {
      setupOnerror(() => {
        assert.notOk('This should not error');
      });

      let snippet = stripIndent`
        | Color | Food |
        | ----  | ---- |
        | red   | apple |
        | yellow| banana |
      `;

      let component: ComponentLike | undefined;

      await compile(snippet, {
        format: 'glimdown',
        onSuccess: (comp) => (component = comp),
        onError: () => assert.notOk('did not expect error'),
        onCompileStart: () => {
          /* not used */
        },
      });

      debugAssert(`[BUG]`, component);

      await render(component);

      assert.dom('table').exists();
      assert.dom('td').containsText('red');
    });

    test('footnotes', async function (assert) {
      setupOnerror(() => {
        assert.notOk('This should not error');
      });

      let snippet = stripIndent`
        text[^note]

        [^note]: a note about a thing
      `;

      let component: ComponentLike | undefined;

      await compile(snippet, {
        format: 'glimdown',
        onSuccess: (comp) => (component = comp),
        onError: () => assert.notOk('did not expect error'),
        onCompileStart: () => {
          /* not used */
        },
      });

      debugAssert(`[BUG]`, component);

      await render(component);

      assert.dom('sup').exists();
      assert.dom('a').exists({ count: 2 }); // to and from the footnote
    });
  });
});
