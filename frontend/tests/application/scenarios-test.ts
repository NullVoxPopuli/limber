import { click, visit } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';

import { DEFAULT_SNIPPET, WITH_LIVE_HBS, WITH_LIVE_JS } from 'limber/starting-snippet';

import { setupWindowOnError } from '../-utils';
import { Page } from './-page';

module('Scenarios', function (hooks) {
  setupApplicationTest(hooks);
  setupWindowOnError(hooks, (error: string) => {
    if (error.includes('export')) {
      console.warn('Still waiting on https://github.com/microsoft/vscode/pull/123739');

      return;
    }

    console.error(error);
    throw error;
  });

  let page = new Page();

  module('compile and run user input', function () {
    module('the Demos work', function () {
      test('Welcome - static', async function (assert) {
        await visit('/');

        assert.dom(page.nav.activeTab.element).hasText('Preview');
        assert.true(page.editor.hasText(DEFAULT_SNIPPET), 'snippet loaded');

        assert.false(page.out.hasCodeSnippets);
        assert.false(page.out.hasRenderedSnippets);
      });

      test('inline HBS - static', async function (assert) {
        await visit('/');
        await page.editor.load();
        await page.demo.select('With inline Templates');

        assert.dom(page.nav.activeTab.element).hasText('Preview');
        assert.true(page.editor.hasText(WITH_LIVE_HBS), 'snippet loaded');

        assert.true(page.out.hasCodeSnippets);
        assert.true(page.out.hasRenderedSnippets);
      });

      test('inline JS - interactive', async function (assert) {
        await visit('/');
        await page.editor.load();
        await page.demo.select('With inline Javascript');

        assert.dom(page.nav.activeTab.element).hasText('Preview');
        assert.true(page.editor.hasText(WITH_LIVE_JS), 'snippet loaded');

        assert.true(page.out.hasCodeSnippets);
        assert.true(page.out.hasRenderedSnippets);
        assert.dom(page.out.element).containsText('clicked the button 1 times');

        await click(page.out.firstButton);
        assert.dom(page.out.element).containsText('clicked the button 2 times');
      });
    });

    module('input is valid', function () {});

    module('input is invalid', function () {});
  });
});
