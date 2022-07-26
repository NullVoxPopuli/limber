import Controller from '@ember/controller';
import { assert as debugAssert } from '@ember/debug';
import { settled, visit } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';

import { ALL, getFromLabel } from 'limber/snippets';

import { getService } from '../helpers';
import { Page } from './-page';

module('Demos', function (hooks) {
  setupApplicationTest(hooks);

  let page = new Page();

  module('every option correctly changes the query params', function () {
    for (let demo of ALL) {
      test(demo.label, async function (assert) {
        this.owner.register('template:edit', hbs`<Limber::DemoSelect />`);

        await visit('/edit');
        await page.selectDemo(demo.label);

        let { queryParams = {} } = getService('router').currentRoute;

        assert.strictEqual(queryParams.format, 'glimdown');
        assert.strictEqual(queryParams.t, await getFromLabel(demo.label));
      });
    }
  });

  module('The output frame renders every demo', function () {
    for (let demo of ALL) {
      test(demo.label, async function (assert) {
        let makeComponent!: (text: string) => void;
        let setParentFrame!: (parentAPI: {
          beginCompile: () => void;
          error: () => void;
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
        this.owner.register('template:edit', hbs`<Limber::Output @messagingAPI={{this.api}} />`);

        await visit('/edit');

        debugAssert(`setParentFrame did not get set`, setParentFrame);
        debugAssert(`makeComponent did not get set`, makeComponent);

        setParentFrame({
          beginCompile: () => assert.step('begin compile'),
          error: () => assert.step('error'),
          success: () => assert.step('success'),
          finishedRendering: () => assert.step('finished rendering'),
        });

        let text = await getFromLabel(demo.label);

        makeComponent(text);
        await settled();

        assert.verifySteps(['begin compile', 'success', 'finished rendering']);
      });
    }
  });
});
