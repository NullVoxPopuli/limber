import { render, select } from '@ember/test-helpers';
import { module, test } from 'qunit';

import { Selection } from 'tutorial/components/selection';
import { setupRenderingTest } from 'tutorial/tests/helpers';

import { MockDocsService, MockRouterService } from '../../helpers/mocks';

module('Integration | Component | selection', function (hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function () {
    this.owner.register('service:docs', MockDocsService);
    this.owner.register('service:router', MockRouterService);
  });

  test('it renders groups and options', async function (assert) {
    const docsSvc = this.owner.lookup(
      'service:docs'
    ) as unknown as MockDocsService;

    docsSvc._setGroupsData([
      [
        '1-introduction',
        [
          '1-basics',
          '2-adding-data',
          '3-transforming-data',
          '4-multiple-transforms',
        ],
      ],
      ['2-reactivity', ['1-values', '2-decorated-values', '3-derived-values']],
      ['3-event-handling', ['1-dom-events']],
    ]);

    await render(<template><Selection /></template>);
    assert.dom('select').hasAttribute('name', 'tutorial');
    assert.dom('select > optgroup').exists({ count: 3 });
    assert.dom('option').exists({ count: 8 });
    // Check group labels
    assert.dom('optgroup:nth-child(1)').hasAttribute('label', 'Introduction');
    assert.dom('optgroup:nth-child(2)').hasAttribute('label', 'Reactivity');
    assert.dom('optgroup:nth-child(3)').hasAttribute('label', 'Event Handling');
    // Spot check some option values
    assert
      .dom('optgroup:nth-child(1) option:nth-child(4)')
      .hasValue('/1-introduction/4-multiple-transforms');
    assert
      .dom('optgroup:nth-child(1) option:nth-child(4)')
      .hasText('Multiple Transforms');
    assert
      .dom('optgroup:nth-child(2) option:nth-child(2)')
      .hasValue('/2-reactivity/2-decorated-values');
    assert
      .dom('optgroup:nth-child(2) option:nth-child(2)')
      .hasText('Decorated Values');
  });

  test('it handles selection', async function (assert) {
    const routerSvc = this.owner.lookup(
      'service:router'
    ) as unknown as MockRouterService;

    routerSvc._setAssert(assert);

    const docsSvc = this.owner.lookup(
      'service:docs'
    ) as unknown as MockDocsService;

    docsSvc._setGroupsData([
      ['english', ['one', 'two', 'three']],
      ['spanish', ['uno', 'dos', 'tres']],
      ['german', ['eins', 'zwei', 'drei']],
    ]);
    docsSvc._setCurrentPath('/spanish/dos');

    await render(<template><Selection /></template>);
    assert.dom('select').hasAttribute('name', 'tutorial');
    assert.dom('select > optgroup').exists({ count: 3 });
    assert.dom('option').exists({ count: 9 });

    assert.dom('select').hasValue('/spanish/dos');
    // Not sure why, but `:checked` is how you get selected option
    assert.dom('option:checked').hasValue('/spanish/dos').hasText('Dos');

    await select('select', '/german/eins');
    docsSvc._setCurrentPath('/german/eins');
    assert.dom('option:checked').hasValue('/german/eins').hasText('Eins');

    await select('select', '/english/three');
    docsSvc._setCurrentPath('/english/three');
    assert.dom('option:checked').hasValue('/english/three').hasText('Three');

    assert.verifySteps([
      'transition to: /german/eins',
      'transition to: /english/three',
    ]);
  });
});
