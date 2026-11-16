import { click, find, visit, waitUntil } from '@ember/test-helpers';
import QUnit, { module, test } from 'qunit';

import { getCompiler } from 'ember-repl';
import LZString from 'lz-string';

import { setupApplicationCompilerTest } from '#tests/helpers.ts';

const { compressToEncodedURIComponent } = LZString;

const summary = '[data-test-error-summary]';
const frame = '[data-test-error-frame]';
const details = '[data-test-error-details]';

module('Output > Status bar', function (hooks) {
  setupApplicationCompilerTest(hooks);

  /**
   * Nobody awaits a failed compile, so the browser also reports an unhandled rejection.
   * QUnit fails tests on those.
   */
  let onUncaughtException: typeof QUnit.onUncaughtException;

  hooks.beforeEach(function () {
    onUncaughtException = QUnit.onUncaughtException;

    QUnit.onUncaughtException = () => {};
  });

  hooks.afterEach(function () {
    QUnit.onUncaughtException = onUncaughtException;
  });

  async function visitOutput(text: string) {
    await visit(`/output?format=gjs&c=${compressToEncodedURIComponent(text)}`);
    await waitUntil(() => find('[data-test-error]') || find('[data-test-text]'), {
      timeout: 30_000,
    });
  }

  test('a syntax error shows its line and the source around it', async function (assert) {
    await visitOutput(`const x = ;\n<template>hi</template>`);

    assert.dom(summary).hasText('Expression expected (line 1, column 11)');
    assert.dom(frame).includesText('const x = ;', 'the frame shows without a click');
    assert.dom(details).doesNotExist('the stack of a parser is not useful');
  });

  test('a template error shows the template around it', async function (assert) {
    await visitOutput(`<template>{{nope}}</template>`);

    assert
      .dom(summary)
      .hasText(
        'Attempted to resolve a value in a strict mode template, but that value was not in scope: nope'
      );
    assert.dom(frame).includesText('{{nope}}');
    assert.dom('[data-test-error]').doesNotIncludeText('an unknown module');
  });

  test('a runtime error is one line, with the stack on request', async function (assert) {
    await visitOutput(`throw new Error('boom');\n<template>hi</template>`);

    assert.dom(summary).hasText('boom');
    assert.dom(frame).doesNotExist();
    assert.dom('[data-test-error] details').doesNotHaveAttribute('open', 'the stack is folded');

    await click(summary);

    assert.dom('[data-test-error] details').hasAttribute('open');
    assert.dom(details).includesText('index.gjs');
  });

  test('a dismissed error comes back for the next error, and leaves on success', async function (assert) {
    await visitOutput(`throw new Error('first');\n<template>hi</template>`);

    assert.dom(summary).hasText('first');

    await click('[data-test-dismiss-error]');

    assert.dom('[data-test-error]').doesNotExist();

    const compiler = getCompiler(this.owner);

    await compiler.compile('gjs', `throw new Error('second');\n<template>hi</template>`);
    await waitUntil(() => find(summary)?.textContent?.includes('second'));

    assert.dom(summary).hasText('second');

    await compiler.compile('gjs', `<template>fine</template>`);

    assert.dom('[data-test-error]').doesNotExist();
  });
});
