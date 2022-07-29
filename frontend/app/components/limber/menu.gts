import { assert } from '@ember/debug';
// @ts-ignore
import { hash } from '@ember/helper';
// @ts-ignore
import HeadlessMenu from 'ember-headlessui/components/menu';
import { PopperJS } from 'ember-popperjs';

import type { ComponentLike } from "@glint/template";
import type { TOC } from '@ember/component/template-only';

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

const DefaultTrigger: TOC<{
  Element: HTMLButtonElement;
  Args: {
    menu: any;
  };
  Blocks: {
    default: [any];
  }
}> = <template>
  <@menu.Button
    {{!-- @glint-ignore --}}
    {{@trigger}}
    class="
      text-black
      rounded-sm border border-gray-900 bg-white px-2 py-1 -my-1 text-left
      transition ease-in-out duration-150 sm:text-sm
      focus:ring-4 focus-visible:outline-none ring-ember-brand focus:outline-none
    "
    ...attributes
  >
    {{yield @menu}}
  </@menu.Button>
</template>;

const PlainTrigger: TOC<{
  Element: HTMLButtonElement;
  Args: {
    menu: any;
  };
  Blocks: {
    default: [{ isOpen: boolean }];
  }
}> = <template>
  <@menu.Button
    {{!-- @glint-ignore --}}
    {{@trigger}}
    ...attributes
  >
    {{yield @menu}}
  </@menu.Button>
</template>;

const portalTarget = (name: string) => {
  let selector = `[data-portal="${name}"]`;
  let element = document.querySelector(selector);

  assert(
    `Expected to find portal target element matching \`${selector}\`, `
    + `but did not find one.`, element);

  return element;
}

const Menu: TOC<{
  Blocks: {
    trigger: [{
      menu: { isOpen: boolean },
      // TODO: what are these types?
      isOpen: boolean,
      Default: any,
      Button: any,
      modifiers: any
    }],
    options: [ComponentLike<{ Element: HTMLButtonElement, Blocks: { default: []} }>],
  }
}> = <template>
  <HeadlessMenu as |menu|>
    <PopperJS as |trigger popover|>

      {{yield
        (hash
          menu=menu
          isOpen=menu.isOpen
          modifiers=trigger
          Button=(component PlainTrigger menu=menu trigger=trigger)
          Default=(component DefaultTrigger menu=menu trigger=trigger)
        )
        to="trigger"
      }}

      {{#in-element (portalTarget "popover")}}
        <menu.Items
          {{!-- @glint-ignore --}}
          {{popover}}
          class="absolute top-2 z-20 grid mt-1 rounded-sm bg-white drop-shadow-lg min-w-max"
          data-test-menu-items
          as |items|
        >
          {{yield (component Button item=items.Item) to="options"}}
        </menu.Items>
      {{/in-element}}

    </PopperJS>
  </HeadlessMenu>
</template>

export default Menu;
