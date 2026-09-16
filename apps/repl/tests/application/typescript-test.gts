import { settled, waitFor } from '@ember/test-helpers';
import { module, test } from 'qunit';

import { setupApplicationCompilerTest } from '#tests/helpers.ts';

import { Page } from './-page';

/**
 * The language server is TypeScript compiled to wasm, loaded on the first gts
 * document. Diagnostics arrive a moment after the document syncs.
 */
const DIAGNOSTIC = '.cm-lintRange-error';
const LOAD_TIMEOUT = 90_000;

module('Editor > TypeScript', function (hooks) {
  setupApplicationCompilerTest(hooks);

  const page = new Page();

  test('a gts document gets type diagnostics for the script and the template', async function (assert) {
    const gts = [
      `import Component from '@glimmer/component';`,
      ``,
      `export default class Demo extends Component<{ Args: { count: number } }> {`,
      `  get doubled(): string {`,
      `    return this.args.count * 2;`,
      `  }`,
      ``,
      `  <template>{{this.doubled}} {{this.nope}}</template>`,
      `}`,
    ].join('\n');

    await page.visitEdit('gts', gts);
    await page.editor.load();
    await settled();

    await waitFor(DIAGNOSTIC, { timeout: LOAD_TIMEOUT });

    assert
      .dom(DIAGNOSTIC)
      .exists({ count: 2 }, 'the script error and the template error are marked');
  });

  test('a js document is left alone', async function (assert) {
    await page.visitEdit(
      'js',
      `export default function render(element) {\n  element.textContent = 'hi';\n}`
    );
    await page.editor.load();
    await settled();

    assert.dom(DIAGNOSTIC).doesNotExist();
  });
});
