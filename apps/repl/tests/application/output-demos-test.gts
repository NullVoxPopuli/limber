import { settled } from '@ember/test-helpers';
import { module, test } from 'qunit';

import { getCompiler } from 'ember-repl';

import { Output } from '#components/output.gts';
import { DemoSelect } from '#edit/demo-select.gts';
import { setupApplicationCompilerTest } from '#tests/helpers.ts';

import { ALL, getFromLabel } from 'limber/snippets';
import { fileFromParams } from 'limber/utils/messaging';

import { getService } from '../helpers';
import { Page } from './-page';

module('Output > Demos', function (hooks) {
  setupApplicationCompilerTest(hooks);

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
    this.owner.lookup('service:editor').setCodemirrorState = () => {};
  });

  module('every option correctly changes the query params', function () {
    for (const demo of ALL) {
      test(demo.label, async function (assert) {
        this.owner.register('template:edit', <template><DemoSelect /></template>);

        await page.expectRedirectToContent('/edit');
        await page.selectDemo(demo.label);

        const { queryParams = {} } = getService('router').currentRoute ?? {};

        const file = fileFromParams(queryParams);

        assert.strictEqual(queryParams.format, demo.format);
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
          <template>
            <fieldset class="border">
              <legend>Limber::Output</legend>
              <Output />
            </fieldset>
          </template>
        );

        await page.expectRedirectToContent('/edit');

        if ('snippet' in demo) {
          this.owner.lookup('service:editor').updateDemo(demo.snippet, demo);
        } else {
          const response = await fetch(demo.path);
          const text = await response.text();

          this.owner.lookup('service:editor').updateDemo(text, demo);
        }

        await settled();

        const text = await getFromLabel(demo.label);

        // eslint-disable-next-line no-console
        console.log({ text });
        await settled();

        // NOTE: These messages are dynamic
        assert.ok(
          getCompiler(this).messages.length > 0,
          `Renderer has messages for the status output`
        );
      });
    }
  });
});
