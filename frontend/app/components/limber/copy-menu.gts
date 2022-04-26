import Component from '@glimmer/component';
import { on } from '@ember/modifier';
import { action } from '@ember/object';

import { toBlob, toPng } from 'html-to-image';

import Menu from './menu';

/**
 * This component is injected via the markdown rendering
 */
export default class CopyMenu extends Component {
  @action
  copyAsText(event: Event) {
    let code = getSnippetElement(event);

    navigator.clipboard.writeText(code.innerText);
  }

  @action
  async copyAsImage(event: Event) {
    let code = getSnippetElement(event);

    await withExtraStyles(code, () => toClipboard(code));
  }

  <template>
    <Menu class="absolute top-3 right-4 z-10" data-test-copy-menu>
      <:trigger>
        📋
      </:trigger>


      <:options as |Item|>
        <Item {{on 'click' this.copyAsText}}>
          Copy as text
        </Item>
        <Item {{on 'click' this.copyAsImage}}>
          Copy as image
        </Item>
      </:options>
    </Menu>
  </template>
}


/*************************************************
 *
 * Helpers and stuff
 *
 * ********************************************/

function getSnippetElement(event: Event) {
  let target = event.target as HTMLElement;

  /**
   * This component has intimate knowledge
   * of how we build markdown previews in
   * markdown-to-ember.ts
   *
   * We can't select the pre tag directly, otherwise html-to-image
   * loses the padding, border-radius, shadow
   */
  let code = target.closest('.glimdown-snippet') as HTMLDivElement;

  if (!code) {
    return target.closest('[data-test-output]') as HTMLDivElement;
  }

  return code;
}

async function withExtraStyles(target: HTMLElement, next: () => Promise<void>) {
  let pre = target.querySelector('pre');

  if (!pre) {
    return await next();
  }

  pre.classList.add('shadow-lg');
  pre.style.margin = '0';

  try {
    await next();
  } finally {
    pre.classList.remove('shadow-lg');
    pre.setAttribute('style', '');
  }
}

async function toClipboard(target: HTMLElement) {
  let backgroundColor = '#ffffff';
  let canCopyToImage = 'ClipboardItem' in window;
  let buttons = [
    ...target.querySelectorAll(
      '[data-test-copy-menu], [data-test-copy-menu] + [data-test-menu-items]'
    ),
  ];
  let filter = (node: HTMLElement | Text) => {
    if (node instanceof Text) return true;

    return !buttons.includes(node);
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
