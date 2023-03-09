import { assert } from '@ember/debug';
// @ts-ignore
import { hash } from '@ember/helper';
import HeadlessMenu from 'ember-headlessui/components/menu';
import type * as MenuTypes from 'ember-headlessui/components/menu';
import { PopperJS } from 'ember-popperjs';

import type { ModifierLike, WithBoundArgs } from "@glint/template";
import type { TOC } from '@ember/component/template-only';

const Button: TOC<{
  Element: HTMLButtonElement;
  Args: {
    item: MenuTypes.Item
  },
  Blocks: {
    default: []
  }
}> = <template>
  <@item as |i|>
    <i.Element
      @tagName='button'
      class='bg-transparent block w-full select-none py-2 px-4 text-left text-black hover:bg-gray-100 focus:ring-4 ring-inset focus:outline-none'
      tabindex='0'
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
    menu: MenuTypes.Menu;
    trigger: ModifierLike;
  };
  Blocks: {
    default: [MenuTypes.Menu];
  }
}> = <template>
  <@menu.Button
    {{@trigger}}
    class="
      text-black rounded border bg-white px-2 py-1 -my-1 text-left transition ease-in-out duration-150 sm:text-sm
      drop-shadow-md hover:drop-shadow-xl
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
    menu: MenuTypes.Menu;
    trigger: ModifierLike;
  };
  Blocks: {
    default: [MenuTypes.Menu];
  }
}> = <template>
  <@menu.Button {{@trigger}} ...attributes>
    {{yield @menu}}
  </@menu.Button>
</template>;

const Items: TOC<{
  Element: HTMLDivElement
  Args: {
    popover: ModifierLike;
    items: MenuTypes.Items;
  };
  Blocks: {
    default: [button: WithBoundArgs<typeof Button, 'item'>]
  }
}> = <template>
  <@items
    {{@popover}}
    class='absolute top-2 z-20 grid mt-1 rounded-sm bg-white drop-shadow-lg min-w-max'
    data-test-menu-items
    ...attributes
    as |items|
  >
    {{yield (component Button item=items.Item)}}
  </@items>
</template>;

const portalTarget = () => {
  let selector = `[data-portal="popover"]`;
  let element = document.querySelector(selector);

  assert(
    `Expected to find portal target element matching \`${selector}\`, `
    + `but did not find one.`, element);

  return element;
}

const not = (x: unknown) => !x;

const Menu: TOC<{
  Element: HTMLDivElement;
  Args: {
    portal?: boolean;
  }
  Blocks: {
    trigger: [{
      menu: MenuTypes.Menu,
      isOpen: boolean,
      Default: WithBoundArgs<typeof DefaultTrigger, 'menu' | 'trigger'>,
      Button: WithBoundArgs<typeof PlainTrigger, 'menu' | 'trigger'>,
      modifiers: ModifierLike;
    }],
    options: [button: WithBoundArgs<typeof Button, 'item'>],
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
        to='trigger'
      }}

      {{#if menu.isOpen}}
        {{#if (not @portal)}}
          <Items @items={{menu.Items}} @popover={{popover}} ...attributes as |Button|>
            {{yield Button to="options"}}
          </Items>
        {{else}}
          {{#in-element (portalTarget)}}
            <Items @items={{menu.Items}} @popover={{popover}} ...attributes as |Button|>
              {{yield Button to="options"}}
            </Items>
          {{/in-element}}
        {{/if}}
      {{/if}}

    </PopperJS>
  </HeadlessMenu>
</template>

export default Menu;
