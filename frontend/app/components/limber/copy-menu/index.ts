import Component from '@glimmer/component';
import { setComponentTemplate } from '@ember/component';
import { action } from '@ember/object';
import { hbs } from 'ember-cli-htmlbars';

import { toBlob, toPng } from 'html-to-image';

/**
 * This component is injected via the markdown rendering
 */
class CopyMenu extends Component {
  get canCopyToImage() {
    return 'ClipboardItem' in window;
  }

  @action
  copyAsText(event: Event) {
    let code = this._getSnippetElement(event);

    if (!code) return;

    navigator.clipboard.writeText(code.innerText);
  }

  @action
  async copyAsImage(event: Event) {
    let code = this._getSnippetElement(event);

    if (!code) return;

    if (!this.canCopyToImage) {
      let image = new Image();
      let dataUri = await toPng(code);

      image.src = dataUri;

      let w = window.open('');

      w?.document.write(
        `Your browser does not support ` +
          `<a target="_blank" href="https://caniuse.com/?search=ClipboardItem">ClipboardItem</a> yet. <br><br>` +
          image.outerHTML
      );
    }

    let blob = await toBlob(code);

    // Works in chrome-based browsers only :(
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
  }

  @action
  _getSnippetElement(event: Event) {
    let target = event.target as HTMLElement;

    /**
     * This component has intimate knowledge
     * of how we build markdown previews in
     * markdown-to-ember.ts
     */
    let code = target.closest('.glimdown-snippet')?.querySelector('pre');

    return code;
  }
}

export default setComponentTemplate(
  hbs`
    <Menu class="absolute top-3 right-4 z-10" data-test-copy-menu ...attributes as |menu|>
      <PopperJS as |trigger popover|>
        <menu.Button
          {{trigger}}
          class="
            text-black
            relative rounded-sm border border-gray-900 bg-white px-2 py-1 -my-1 text-left
            transition ease-in-out duration-150 sm:text-sm
            focus:ring-4 focus-visible:outline-none ring-ember-brand focus:outline-none
          "
      >
        📋
      </menu.Button>
      <menu.Items
        {{popover}}
        class="absolute top-2 z-10 grid mt-1 rounded-sm bg-white shadow-lg min-w-max"
        as |items|
      >
        <items.Item as |item|>
          <item.Element
            {{on 'click' this.copyAsText}}
            @tagName="button"
            class="
              bg-transparent
              block w-full select-none relative py-2 px-4 text-left
              text-black hover:bg-gray-100 focus:ring-4 ring-inset focus:outline-none
            "
            tabindex="0"
          >
            Copy as text
          </item.Element>
        </items.Item>
        <items.Item as |item|>
          <item.Element
            {{on 'click' this.copyAsImage}}
            @tagName="button"
            class="
              bg-transparent
              block w-full select-none relative py-2 px-4 text-left
              text-black hover:bg-gray-100 focus:ring-4 ring-inset focus:outline-none
            "
            tabindex="0"
          >
            Copy as image
          </item.Element>
        </items.Item>
      </menu.Items>
    </PopperJS>
  </Menu>
  `,
  CopyMenu
);
