import { waitUntil } from '@ember/test-helpers';
import { module, test } from 'qunit';

import { setupApplicationCompilerTest } from '#tests/helpers.ts';

import { Page } from './-page';

const doc = `<!doctype html>
<html>
  <head>
    <style>
      #styled { color: rgb(255, 0, 0); }
    </style>
  </head>
  <body>
    <p id="styled">styled</p>
    <p id="classic"></p>
    <p id="module"></p>
    <script>
      document.querySelector('#classic').textContent = 'classic ran';
    </script>
    <script type="module">
      document.querySelector('#module').textContent = 'module ran';
    </script>
  </body>
</html>`;

/**
 * The output can be in a shadow root, depending on the `shadowdom` query param.
 */
function htmlFrame() {
  const selector = 'iframe[title="HTML output"]';
  const inPage = document.querySelector<HTMLIFrameElement>(selector);

  if (inPage) return inPage;

  for (const element of document.querySelectorAll('[data-test-compiled-output] *')) {
    const inShadow = element.shadowRoot?.querySelector<HTMLIFrameElement>(selector);

    if (inShadow) return inShadow;
  }
}

module('Output > HTML', function (hooks) {
  setupApplicationCompilerTest(hooks);

  const page = new Page();

  test('the page runs its scripts and styles in a frame', async function (assert) {
    await page.visitEdit('html', doc);

    const text = (id: string) => htmlFrame()?.contentDocument?.querySelector(id)?.textContent;

    await waitUntil(() => text('#classic') === 'classic ran', { timeout: 10_000 });
    assert.step('classic script');

    await waitUntil(() => text('#module') === 'module ran', { timeout: 10_000 });
    assert.step('module script');

    const frameDoc = htmlFrame()!.contentDocument!;
    const styled = frameDoc.querySelector('#styled')!;

    assert.strictEqual(frameDoc.defaultView!.getComputedStyle(styled).color, 'rgb(255, 0, 0)');
    assert.step('style');

    assert.verifySteps(['classic script', 'module script', 'style']);
  });
});
