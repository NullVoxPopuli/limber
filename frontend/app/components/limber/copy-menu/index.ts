import Component from '@glimmer/component';
import { setComponentTemplate } from '@ember/component';
import { action } from '@ember/object';
import { hbs } from 'ember-cli-htmlbars';

/**
 * This component is injected via the markdown rendering
 */
class CopyMenu extends Component {
  @action
  copyAsText(event: Event) {
    let target = event.target as HTMLElement;

    /**
     * This component has intimate knowledge
     * of how we build markdown previews in
     * markdown-to-ember.ts
     */
    let code = target.parentElement?.querySelector('pre');

    if (!code) return;

    navigator.clipboard.writeText(code.innerText);
  }

  @action
  copyAsImage() {
    /* ... */
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
              text-black hover:bg-gray-100 focus:ring-4 ring-inset
            "
            tabindex="0"
          >
            Copy as text
          </item.Element>
        </items.Item>
        <items.Item as |item|>
          <item.Element
            {{on 'click' this.copyAsText}}
            @tagName="button"
            class="
              bg-transparent
              block w-full select-none relative py-2 px-4 text-left
              text-black hover:bg-gray-100 focus:ring-4 ring-inset
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
