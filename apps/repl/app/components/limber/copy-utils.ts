import { toBlob, toPng } from 'html-to-image';

export function getSnippetElement(event: Event) {
  /**
   * Use the composedPath to get the actual element instead of
   * closest, because the element may be removed from the DOM
   * by the time this function runs.
   */
  const ancestry = event.composedPath();

  /**
   * This component has intimate knowledge
   * of how we build markdown previews in
   * markdown-to-ember.ts
   *
   * We can't select the pre tag directly, otherwise html-to-image
   * loses the padding, border-radius, shadow
   */
  for (const element of ancestry) {
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

/**
 * Cloning elements for screenshotting is hard.
 * Look at all this:
 *   https://github.com/bubkoo/html-to-image/blob/128dc3edfde95d6ac636f2756630f5cbd6f7c8df/src/clone-node.ts#L231
 *
 * So instead, we jitter a bit
 */
export async function copyToClipboard(toCopy: HTMLElement) {
  const pre = toCopy.querySelector('pre');

  try {
    pre?.classList.add('drop-shadow-lg');
    Object.assign(toCopy.style, {
      margin: 0,
      display: 'inline-block',
      width: 'fit-content',
    });
    await toClipboard(toCopy);
  } finally {
    pre?.classList.remove('drop-shadow-lg');
    Object.assign(toCopy.style, {
      margin: 'unset',
      display: 'unset',
      width: 'unset',
    });
  }
}

async function toClipboard(target: HTMLElement) {
  const backgroundColor = '#ffffff';
  const canCopyToImage = 'ClipboardItem' in window;
  const filter = (node: HTMLElement | Text) => {
    if (node instanceof Text) return true;

    if ('getAttribute' in node && node.hasAttribute('data-test-copy-menu')) {
      return false;
    }

    if ('classList' in node && node.classList.contains('limber__menu__content')) {
      return false;
    }

    return true;
  };

  const box = target.getBoundingClientRect();

  const options = {
    filter,
    backgroundColor,
    // tell html-to-image to include margins in dimensions
    // html-to-image does not make adjustments if margins exist anyway
    width: box.width + 32,
    height: box.height + 32,
    cacheBust: true,
    /**
     * Good for pasting on social medias
     */
    pixelRatio: 3,
    style: {
      margin: '1rem',
    },
  };

  if (!canCopyToImage) {
    const image = new Image();
    const dataUri = await toPng(target, options);

    image.src = dataUri;

    const w = window.open('');

    w?.document.write(
      `Your browser does not yet support ` +
        `<a target="_blank" href="https://caniuse.com/?search=ClipboardItem">ClipboardItem</a>. <br><br>` +
        image.outerHTML
    );

    return;
  }

  const blob = await toBlob(target, options);

  // Works in chrome-based browsers only :(
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
}
