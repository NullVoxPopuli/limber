import { assert } from '@ember/debug';
import { settled, triggerEvent, waitFor } from '@ember/test-helpers';
import { module, test } from 'qunit';

import { stopTypeScript } from '#app/templates/edit/editor/typescript/client.ts';
import { setupApplicationCompilerTest } from '#tests/helpers.ts';

import { Page } from './-page';

/**
 * The language server is TypeScript compiled to wasm, loaded on the first gts
 * document. Diagnostics arrive a moment after the document syncs.
 */
const DIAGNOSTIC = '.cm-lintRange-error';
const HOVER_TOOLTIP = '.cm-lsp-hover-tooltip';
const LOADING_TOOLTIP = '.cm-lsp-loading';
const LOAD_TIMEOUT = 90_000;

/**
 * Where the mouse has to be to hover a word in the editor: its first
 * occurrence, in document order.
 */
function pointOver(word: string) {
  const content = document.querySelector('.cm-content');

  assert(`The editor has no content element`, content);

  const walker = document.createTreeWalker(content, NodeFilter.SHOW_TEXT);

  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    const text = node as Text;
    const index = text.data.indexOf(word);

    if (index === -1) continue;

    const range = document.createRange();

    range.setStart(text, index);
    range.setEnd(text, index + word.length);

    const rect = range.getBoundingClientRect();

    return {
      element: content,
      clientX: rect.x + rect.width / 2,
      clientY: rect.y + rect.height / 2,
    };
  }

  throw new Error(`${word} is not in the editor`);
}

module('Editor > TypeScript', function (hooks) {
  setupApplicationCompilerTest(hooks);

  const page = new Page();

  test('a hover before TypeScript is ready says so, and is answered later', async function (assert) {
    // The language server is one per page, and only the first document waits for it.
    stopTypeScript();

    const gts = [
      `import Component from '@glimmer/component';`,
      ``,
      `export default class Demo extends Component {`,
      `  get greeting(): string {`,
      `    return 'hi';`,
      `  }`,
      ``,
      `  <template>{{this.greeting}}</template>`,
      `}`,
    ].join('\n');

    await page.visitEdit('gts', gts);

    /**
     * Plain events, because the test helpers wait for settled, and the
     * pending TypeScript load is a test waiter: the editor would only be
     * asked once the server is ready. The editor exists a moment before it
     * listens for hovers, and a hover counts after the mouse has rested.
     */
    document.body.dispatchEvent(new MouseEvent('mousemove', { bubbles: true }));
    await waitFor('.cm-content');

    const { element, clientX, clientY } = pointOver('greeting');

    let loading: string | undefined;
    const deadline = Date.now() + 10_000;

    while (!loading && Date.now() < deadline) {
      element.dispatchEvent(new MouseEvent('mousemove', { bubbles: true, clientX, clientY }));
      await new Promise((resolve) => setTimeout(resolve, 400));

      loading = document.querySelector(LOADING_TOOLTIP)?.textContent?.trim();
    }

    assert.ok(loading, `the tooltip says what the loading is doing: ${loading}`);

    await waitFor(HOVER_TOOLTIP, { timeout: LOAD_TIMEOUT });

    assert.dom(HOVER_TOOLTIP).includesText('Demo.greeting: string', 'the hover was answered');
    assert.dom(LOADING_TOOLTIP).doesNotExist();

    await settled();
  });

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

  test('a tracked property is not an error', async function (assert) {
    const gts = [
      `import Component from '@glimmer/component';`,
      `import { tracked } from '@glimmer/tracking';`,
      ``,
      `export default class Counter extends Component {`,
      `  @tracked count = 0;`,
      ``,
      `  <template>{{this.count}} {{this.nope}}</template>`,
      `}`,
    ].join('\n');

    await page.visitEdit('gts', gts);
    await page.editor.load();
    await settled();

    await waitFor(DIAGNOSTIC, { timeout: LOAD_TIMEOUT });

    assert.dom(DIAGNOSTIC).exists({ count: 1 }, 'only the template error is marked');
  });

  test('hovering a member shows its documentation', async function (assert) {
    const gts = [
      `import Component from '@glimmer/component';`,
      ``,
      `export default class Demo extends Component {`,
      `  /**`,
      `   * How to say hello, like \`\${title} \${lastName}\`.`,
      `   *`,
      `   * \`\`\`hbs`,
      `   * <Demo @name="Ember" />`,
      `   * \`\`\``,
      `   */`,
      `  get greeting(): string {`,
      `    return 'hi';`,
      `  }`,
      ``,
      `  <template>{{this.greeting}} {{this.nope}}</template>`,
      `}`,
    ].join('\n');

    await page.visitEdit('gts', gts);
    await page.editor.load();
    await settled();

    await waitFor(DIAGNOSTIC, { timeout: LOAD_TIMEOUT });

    const { element, clientX, clientY } = pointOver('greeting');

    await triggerEvent(element, 'mousemove', { clientX, clientY });
    await waitFor(HOVER_TOOLTIP, { timeout: 10_000 });

    assert.dom(HOVER_TOOLTIP).includesText('Demo.greeting: string', 'the signature');
    assert.dom(HOVER_TOOLTIP).includesText('${title} ${lastName}', 'the documentation, as written');
    assert.dom(HOVER_TOOLTIP).includesText('<Demo @name="Ember" />', 'an hbs example renders');
    assert.dom(`${HOVER_TOOLTIP} pre.shiki`).exists('the signature is highlighted');
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
