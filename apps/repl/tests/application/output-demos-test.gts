import { settled } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';

import Route from 'ember-route-template';

import { DemoSelect } from 'limber/components/limber/demo-select';
import { Output } from 'limber/components/limber/output';
import { ALL, getFromLabel } from 'limber/snippets';
import { fileFromParams } from 'limber/utils/messaging';

import { getService } from '../helpers';
import { Page } from './-page';

module('Output > Demos', function (hooks) {
  setupApplicationTest(hooks);

  const page = new Page();

  /**
   * The editor is excluded from these tests,
   * but in order for the URI to change, the editor must be "set up".
   *
   * The editor service knows when this happens via _editorSwapText
   * being set. Until that property is set, calls to updateDemo will
   * be ignored.
   */
  hooks.beforeEach(function () {
    this.owner.lookup('service:editor')._editorSwapText = () => {};
  });

  module('every option correctly changes the query params', function () {
    for (const demo of ALL) {
      test(demo.label, async function (assert) {
        this.owner.register('template:edit', Route(<template><DemoSelect /></template>));

        await page.expectRedirectToContent('/edit');
        await page.selectDemo(demo.label);

        const { queryParams = {} } = getService('router').currentRoute ?? {};

        const file = fileFromParams(queryParams);

        assert.strictEqual(queryParams.format, 'glimdown');
        assert.strictEqual(file.format, queryParams.format, 'format matches queryParams');
        assert.strictEqual(queryParams.t, undefined, 'old format is no longer in use');
        assert.notStrictEqual(queryParams.c, undefined, 'new format is is what is used');
        assert.strictEqual(file.text, await getFromLabel(demo.label), 'detected text matches demo');
      });
    }
  });

  module('The output frame renders every demo', function () {
    for (const demo of ALL) {
      test(demo.label, async function (assert) {
        this.owner.register(
          'template:edit',
          Route(
            <template>
              <fieldset class="border">
                <legend>Limber::Output</legend>
                <Output />
              </fieldset>
            </template>
          )
        );

        await page.expectRedirectToContent('/edit');

        const text = await getFromLabel(demo.label);

        console.log({ text });
        await settled();

        assert.verifySteps(['begin compile', 'success', 'finished rendering']);
      });
    }
  });
});
