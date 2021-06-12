import Component from '@glimmer/component';
import { setComponentTemplate } from '@ember/component';
import { action } from '@ember/object';
import { hbs } from 'ember-cli-htmlbars';

import { toBlob, toPng } from 'html-to-image';

/**
 * This component is injected via the markdown rendering
 */
class CopyMenu extends Component {
  @action
  copyAsText(event: Event) {
    let code = getSnippetElement(event);

    navigator.clipboard.writeText(code.innerText);
  }

  @action
  async copyAsImage(event: Event) {
    let code = getSnippetElement(event);

    await toClipboard(code);
  }
}

export default setComponentTemplate(
  hbs`
    <Limber::Menu class="absolute top-3 right-4 z-10" data-test-copy-menu>
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
    </Limber::Menu>
  `,
  CopyMenu
);

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
   */
  let code = target.closest('.glimdown-snippet')?.querySelector('pre');

  if (!code) {
    return target.closest('[data-test-output]') as HTMLDivElement;
  }

  return code;
}

async function toClipboard(target: HTMLElement) {
  let canCopyToImage = 'ClipboardItem' in window;
  let filter = (node: HTMLElement | Text) => {
    if (node instanceof Text) return true;

    return !node.hasAttribute('data-test-copy-menu');
  };

  if (!canCopyToImage) {
    let image = new Image();
    let dataUri = await toPng(target, { filter });

    image.src = dataUri;

    let w = window.open('');

    w?.document.write(
      `Your browser does not yet support ` +
        `<a target="_blank" href="https://caniuse.com/?search=ClipboardItem">ClipboardItem</a>. <br><br>` +
        image.outerHTML
    );

    return;
  }

  let blob = await toBlob(target, { filter });

  // Works in chrome-based browsers only :(
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
}
