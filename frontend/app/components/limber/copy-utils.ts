import { toBlob, toPng } from 'html-to-image';

export function getSnippetElement(event: Event) {
  /**
    * Use the composedPath to get the actual element instead of
  * closest, because the element may be removed from the DOM
  * by the time this function runs.
    */
  let ancestry = event.composedPath();

  /**
   * This component has intimate knowledge
   * of how we build markdown previews in
   * markdown-to-ember.ts
   *
   * We can't select the pre tag directly, otherwise html-to-image
   * loses the padding, border-radius, shadow
   */
  for (let element of ancestry) {
    if (!(element instanceof HTMLElement)) continue;

    if (element.classList.contains('glimdown-snippet')) {
      return element;
    }

    if (element.getAttribute('data-test-output')) {
      return element;
    }

    if (element.getAttribute('data-test-compiled-output')) {
      return element;
    }

    if (element === document.body) {
      return element;
    }
  }

  throw new Error('Could not find snippet element');
}

export async function withExtraStyles(target: HTMLElement, next: () => Promise<void>) {
  let pre = target.querySelector('pre');

  if (!pre) {
    return await next();
  }

  pre.classList.add('drop-shadow-lg');
  pre.style.margin = '0';

  try {
    await next();
  } finally {
    pre.classList.remove('drop-shadow-lg');
    pre.setAttribute('style', '');
  }
}

export async function toClipboard(target: HTMLElement) {
  let backgroundColor = '#ffffff';
  let canCopyToImage = 'ClipboardItem' in window;
  let filter = (node: HTMLElement | Text) => {
    if (node instanceof Text) return true;


    if ('getAttribute' in node && node.hasAttribute('data-test-copy-menu')) {
      return false;
    }

    return true;
  };

  let box = target.getBoundingClientRect();

  let options = {
    filter,
    backgroundColor,
    // tell html-to-image to include margins in dimensions
    // html-to-image does not make adjustments if margins exist anyway
    width: box.width + 32,
    height: box.height + 32,
    pixelRatio: 3,
    style: {
      // m-0
      // make margin uniform all the way around
      margin: '1rem',
    },
  };

  if (!canCopyToImage) {
    let image = new Image();
    let dataUri = await toPng(target, options);

    image.src = dataUri;

    let w = window.open('');

    w?.document.write(
      `Your browser does not yet support ` +
        `<a target="_blank" href="https://caniuse.com/?search=ClipboardItem">ClipboardItem</a>. <br><br>` +
        image.outerHTML
    );

    return;
  }

  let blob = await toBlob(target, options);

  // Works in chrome-based browsers only :(
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
}
