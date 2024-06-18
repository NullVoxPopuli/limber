// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore-expect-error
import { hash } from '@ember/helper';

import {
  Menu as HeadlessMenu
} from 'ember-primitives/components/menu';

import type { TOC } from '@ember/component/template-only';
import type { ComponentLike, WithBoundArgs } from '@glint/template';
import type {
  ItemSignature,
  Signature as MenuSignature,
} from 'ember-primitives/components/menu';

type MenuType = MenuSignature['Blocks']['default'][0]

const Button: TOC<{
  Element: HTMLButtonElement;
  Args: {
    item: ComponentLike<ItemSignature>;
  };
  Blocks: {
    default: [];
  };
}> = <template>
  <@item as |i|>
    <i.Element
      @tagName="button"
      class="bg-transparent block w-full select-none py-2 px-4 text-left text-black hover:bg-gray-100 focus:ring-4 ring-inset focus:outline-none"
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
    menu: MenuType;
  };
  Blocks: {
    default: [MenuType];
  };
}> = <template>
  <@menu.Trigger
    class="text-black rounded border bg-white px-2 py-1 -my-1 text-left transition ease-in-out duration-150 sm:text-sm drop-shadow-md hover:drop-shadow-xl focus:ring-4 focus-visible:outline-none ring-ember-brand focus:outline-none"
    ...attributes
  >
    {{yield @menu}}
  </@menu.Trigger>
</template>;

const PlainTrigger: TOC<{
  Element: HTMLButtonElement;
  Args: {
    menu: MenuTypes.Menu;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    trigger: any;
  };
  Blocks: {
    default: [MenuTypes.Menu];
  };
}> = <template>
  <@menu.Button {{@trigger}} ...attributes>
    {{yield @menu}}
  </@menu.Button>
</template>;

const Items: TOC<{
  Element: HTMLDivElement;
  Args: {
    items: MenuTypes.Items;
  };
  Blocks: {
    default: [button: WithBoundArgs<typeof Button, 'item'>];
  };
}> = <template>
  <@items
    class="z-20 grid rounded border bg-white drop-shadow-xl min-w-max"
    data-test-menu-items
    ...attributes
    as |items|
  >
    {{yield (component Button item=items.Item)}}
  </@items>
</template>;

const Menu: TOC<{
  Element: HTMLDivElement;
  Args: {
    inline?: boolean;
  };
  Blocks: {
    trigger: [
      {
        menu: MenuType;
        isOpen: boolean;
        Default: WithBoundArgs<typeof DefaultTrigger, 'menu'>;
        Button: WithBoundArgs<typeof PlainTrigger, 'menu'>;
      },
    ];
    options: [button: WithBoundArgs<typeof Button, 'item'>];
  };
}> = <template>
  <HeadlessMenu
    @inline={{@inline}}
    @placement="bottom"
    @offsetOptions={{8}}
    @shiftOptions={{hash padding=8}}
    @flipOptions={{hash padding=8}}
  as |menu|>
    {{yield
      (hash
        menu=menu
        isOpen=menu.isOpen
        Button=(component PlainTrigger menu=menu)
        Default=(component DefaultTrigger menu=menu)
      )
      to="trigger"
    }}

    {{! template-lint-disable no-inline-styles }}
    <menu.Content style="width: max-content;z-index:1;" as |content|>
      {{! template-lint-disable no-inline-styles }}
      <div
        class="border"
        style="
        position: absolute;
        background: white;
        width: 8px;
        height: 8px;
        transform: rotate(45deg);
        z-index: 0;
      "
        {{menu.arrow}}
      ></div>

      <Items @items={{menu.Items}} ...attributes as |Button|>
        {{yield Button to="options"}}
      </Items>
    </menu.Content>

  </HeadlessMenu>
</template>;

export default Menu;
