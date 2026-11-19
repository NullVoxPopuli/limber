import { Compiler } from 'repl-sdk';
import { describe, expect, test } from 'vitest';

async function rendered(text: string) {
  const compiler = new Compiler();
  const { element, destroy } = await compiler.compile('html', text);
  const iframe = element.querySelector('iframe');

  expect(iframe, 'HTML renders in to an iframe').toBeTruthy();

  /**
   * The frame loads its srcdoc when it enters the document.
   * Before that, `contentDocument` is the empty initial document.
   */
  const loaded = new Promise((resolve) =>
    iframe!.addEventListener('load', resolve, { once: true })
  );

  document.body.appendChild(element);
  await loaded;

  return { iframe: iframe!, doc: () => iframe!.contentDocument!, element, destroy };
}

describe('html', () => {
  test('classic and module scripts run in the frame', async () => {
    const { doc, element, destroy } = await rendered(`
      <!doctype html>
      <html>
        <body>
          <p id="classic"></p>
          <p id="module"></p>
          <script>
            document.querySelector('#classic').textContent = 'classic ran';
          </script>
          <script type="module">
            const value = await Promise.resolve('module ran');

            document.querySelector('#module').textContent = value;
          </script>
        </body>
      </html>
    `);

    await expect.poll(() => doc().querySelector('#classic')?.textContent).toBe('classic ran');
    await expect.poll(() => doc().querySelector('#module')?.textContent).toBe('module ran');

    destroy();
    element.remove();
  });

  test('module scripts can use an import map', async () => {
    const { doc, element, destroy } = await rendered(`
      <script type="importmap">
        { "imports": { "greeting": "data:text/javascript,export default 'hi from the map'" } }
      </script>
      <p id="out"></p>
      <script type="module">
        import greeting from 'greeting';

        document.querySelector('#out').textContent = greeting;
      </script>
    `);

    await expect.poll(() => doc().querySelector('#out')?.textContent).toBe('hi from the map');

    destroy();
    element.remove();
  });

  test('styles apply in the frame and not to the host page', async () => {
    const { doc, element, destroy } = await rendered(`
      <style>
        p { color: rgb(255, 0, 0); }
      </style>
      <p id="styled">red</p>
    `);

    const hostP = document.createElement('p');

    document.body.appendChild(hostP);

    const styled = doc().querySelector('#styled')!;

    expect(doc().defaultView!.getComputedStyle(styled).color).toBe('rgb(255, 0, 0)');
    expect(getComputedStyle(hostP).color).not.toBe('rgb(255, 0, 0)');

    hostP.remove();
    destroy();
    element.remove();
  });

  test('the frame is as tall as its content', async () => {
    const { iframe, element, destroy } = await rendered(`
      <body style="margin: 0">
        <div id="box" style="height: 400px"></div>
      </body>
    `);

    await expect.poll(() => iframe.getBoundingClientRect().height).toBe(400);

    iframe.contentDocument!.querySelector<HTMLElement>('#box')!.style.height = '600px';

    await expect.poll(() => iframe.getBoundingClientRect().height).toBe(600);

    iframe.contentDocument!.querySelector<HTMLElement>('#box')!.style.height = '50px';

    await expect.poll(() => iframe.getBoundingClientRect().height).toBe(50);

    destroy();
    element.remove();
  });
});
