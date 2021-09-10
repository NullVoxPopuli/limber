import { click, visit } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';

import { DEFAULT_SNIPPET, getFromLabel } from 'limber/snippets';

import { Page } from './-page';

module('Scenarios', function (hooks) {
  setupApplicationTest(hooks);

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
        await page.selectDemo('With inline Templates');
        let demoText = await getFromLabel('With inline Templates');

        assert.dom(page.nav.activeTab.element).hasText('Preview');
        assert.true(page.editor.hasText(demoText), 'snippet loaded');

        assert.true(page.out.hasCodeSnippets);
        assert.true(page.out.hasRenderedSnippets);
      });

      test('inline JS - interactive', async function (assert) {
        await visit('/');
        await page.editor.load();
        await page.selectDemo('With inline Javascript');
        let demoText = await getFromLabel('With inline Javascript');

        assert.dom(page.nav.activeTab.element).hasText('Preview');
        assert.true(page.editor.hasText(demoText), 'snippet loaded');

        assert.true(page.out.hasCodeSnippets);
        assert.true(page.out.hasRenderedSnippets);
        assert.dom(page.out.element).containsText('clicked the button 0 times');

        await click(page.out.firstButton);
        assert.dom(page.out.element).containsText('clicked the button 1 times');
      });

      test('Styleguide Demo', async function (assert) {
        await visit('/');
        await page.editor.load();
        await page.selectDemo('Styleguide Demo');
        let demoText = await getFromLabel('Styleguide Demo');

        assert.dom(page.nav.activeTab.element).hasText('Preview');
        assert.true(page.editor.hasText(demoText), 'snippet loaded');

        assert.true(page.out.hasCodeSnippets);
        assert.true(page.out.hasRenderedSnippets);

        assert.dom(page.out.element).containsText(`Ember.JS' Site`);
      });

      test('REPL', async function (assert) {
        await visit('/');
        await page.editor.load();
        await page.selectDemo('Build your own REPL');
        let demoText = await getFromLabel('Build your own REPL');

        assert.dom(page.nav.activeTab.element).hasText('Preview');
        assert.true(page.editor.hasText(demoText), 'snippet loaded');

        assert.true(page.out.hasCodeSnippets);
        assert.true(page.out.hasRenderedSnippets);

        assert.dom(page.out.element).containsText(`Render`);
      });
    });

    module('input is valid', function () {});

    module('input is invalid', function () {});
  });
});
