import Controller from '@ember/controller';
import { assert as debugAssert } from '@ember/debug';
import { settled, visit } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';

import Route from 'ember-route-template';

import { DemoSelect } from 'limber/components/limber/demo-select';
import { Output } from 'limber/components/limber/output';
import { ALL, getFromLabel } from 'limber/snippets';
import { fileFromParams, type Format } from 'limber/utils/messaging';

import { getService } from '../helpers';
import { Page } from './-page';

module('Output > Demos', function (hooks) {
  setupApplicationTest(hooks);

  let page = new Page();

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
    for (let demo of ALL) {
      test(demo.label, async function (assert) {
        this.owner.register('template:edit', Route(<template><DemoSelect /></template>));

        await visit('/edit');
        await page.selectDemo(demo.label);

        let { queryParams = {} } = getService('router').currentRoute ?? {};

        let file = fileFromParams(queryParams);

        assert.strictEqual(queryParams.format, 'glimdown');
        assert.strictEqual(file.format, queryParams.format, 'format matches queryParams');
        assert.strictEqual(queryParams.t, undefined, 'old format is no longer in use');
        assert.notStrictEqual(queryParams.c, undefined, 'new format is is what is used');
        assert.strictEqual(file.text, await getFromLabel(demo.label), 'detected text matches demo');
      });
    }
  });

  module('The output frame renders every demo', function () {
    for (let demo of ALL) {
      test(demo.label, async function (assert) {
        let makeComponent!: (format: Format, text: string) => void;
        let setParentFrame!: (parentAPI: {
          beginCompile: () => void;
          error: (e: unknown) => void;
          success: () => void;
          finishedRendering: () => void;
        }) => void;

        class FakeController extends Controller {
          api = {
            onReceiveText: (callback: typeof makeComponent) => (makeComponent = callback),
            onConnect: (callback: typeof setParentFrame) => (setParentFrame = callback),
          };
        }
        this.owner.register('controller:edit', FakeController);
        this.owner.register(
          'template:edit',
          Route(
            <template>
              <fieldset class="border">
                <legend>Limber::Output</legend>
                {{! @glint-ignore }}
                <Output @messagingAPI={{@controller.api}} />
              </fieldset>
            </template>
          )
        );

        await visit('/edit');

        debugAssert(`setParentFrame did not get set`, setParentFrame);
        debugAssert(`makeComponent did not get set`, makeComponent);

        setParentFrame({
          beginCompile: () => assert.step('begin compile'),
          error: (e) => assert.step(e as string),
          success: () => assert.step('success'),
          finishedRendering: () => assert.step('finished rendering'),
        });

        let text = await getFromLabel(demo.label);

        makeComponent('glimdown', text);
        await settled();

        assert.verifySteps(['begin compile', 'success', 'finished rendering']);
      });
    }
  });
});
