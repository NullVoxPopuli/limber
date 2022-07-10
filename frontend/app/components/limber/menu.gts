// @ts-ignore
import HeadlessMenu from 'ember-headlessui/components/menu';
import { PopperJS } from 'ember-popperjs';

import type { ComponentLike } from "@glint/template";

import type { TemplateOnlyComponent as TOC } from '@ember/component/template-only';

const Button: TOC<{
  Element: HTMLButtonElement;
  Args: {
    /**
     * TODO: add types to ember-headlessui
     */
    item: any
  },
  Blocks: {
    default: []
  }
}> = <template>
  <@item as |i|>
    <i.Element
      @tagName="button"
      class="
        bg-transparent
        block w-full select-none py-2 px-4 text-left
        text-black hover:bg-gray-100 focus:ring-4 ring-inset focus:outline-none
      "
      tabindex="0"
      data-test-menu-button
      ...attributes
    >
      {{yield}}
    </i.Element>
  </@item>
</template>;

const Menu: TOC<{
  Element: HTMLButtonElement;
  Blocks: {
    trigger: [{ isOpen: boolean }],
    options: [ComponentLike<{ Element: HTMLButtonElement, Blocks: { default: []} }>],
  }
}> = <template>
  <HeadlessMenu as |menu|>
    <PopperJS as |trigger popover|>
      <menu.Button
        {{trigger}}
        class="
          text-black
          rounded-sm border border-gray-900 bg-white px-2 py-1 -my-1 text-left
          transition ease-in-out duration-150 sm:text-sm
          focus:ring-4 focus-visible:outline-none ring-ember-brand focus:outline-none
        "
        ...attributes
      >
        {{yield menu to="trigger"}}
      </menu.Button>
      <menu.Items
        {{popover}}
        class="absolute top-2 z-20 grid mt-1 rounded-sm bg-white shadow-lg min-w-max"
        data-test-menu-items
        as |items|
      >
        {{yield (component Button item=items.Item) to="options"}}
      </menu.Items>
    </PopperJS>
  </HeadlessMenu>
</template>

export default Menu;
