import { render, setupOnerror } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';

import { stripIndent } from 'common-tags';

import { compile } from 'limber/components/limber/output/compiler/formats/gjs';

import type { ComponentLike } from '@glint/template';

module('Unit | gjs | compile()', function (hooks) {
  setupRenderingTest(hooks);

  test('gjs with imports works', async function (assert) {
    assert.expect(2);

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

    let result = await compile(snippet);

    assert.ok(result.rootComponent);
    assert.notOk(result.error);

    await render(result.rootComponent as ComponentLike);
  });
});
