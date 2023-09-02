// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore-expect-error
import { hash } from '@ember/helper';

import HeadlessMenu from 'ember-headlessui/components/menu';
import { Popover } from 'ember-primitives';

import type { TOC } from '@ember/component/template-only';
import type { ModifierLike, WithBoundArgs } from '@glint/template';
import type * as MenuTypes from 'ember-headlessui/components/menu';

const Button: TOC<{
  Element: HTMLButtonElement;
  Args: {
    item: MenuTypes.Item;
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
    menu: MenuTypes.Menu;
    trigger: ModifierLike<any>;
  };
  Blocks: {
    default: [MenuTypes.Menu];
  };
}> = <template>
  <@menu.Button
    {{@trigger}}
    class="text-black rounded border bg-white px-2 py-1 -my-1 text-left transition ease-in-out duration-150 sm:text-sm drop-shadow-md hover:drop-shadow-xl focus:ring-4 focus-visible:outline-none ring-ember-brand focus:outline-none"
    ...attributes
  >
    {{yield @menu}}
  </@menu.Button>
</template>;

const PlainTrigger: TOC<{
  Element: HTMLButtonElement;
  Args: {
    menu: MenuTypes.Menu;
    trigger: ModifierLike<any>;
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
        menu: MenuTypes.Menu;
        isOpen: boolean;
        Default: WithBoundArgs<typeof DefaultTrigger, 'menu' | 'trigger'>;
        Button: WithBoundArgs<typeof PlainTrigger, 'menu' | 'trigger'>;
      },
    ];
    options: [button: WithBoundArgs<typeof Button, 'item'>];
  };
}> = <template>
  <Popover
    @inline={{@inline}}
    @placement="bottom"
    @offsetOptions={{8}}
    @shiftOptions={{hash padding=8}}
    @flipOptions={{hash padding=8}}
    as |p|
  >
    <HeadlessMenu as |menu|>

      {{yield
        (hash
          menu=menu
          isOpen=menu.isOpen
          Button=(component PlainTrigger menu=menu trigger=p.hook)
          Default=(component DefaultTrigger menu=menu trigger=p.hook)
        )
        to="trigger"
      }}

      {{#if menu.isOpen}}
        {{! template-lint-disable no-inline-styles }}
        <p.Content style="width: max-content;z-index:1;">
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
            {{p.arrow}}
          ></div>
          <Items @items={{menu.Items}} ...attributes as |Button|>
            {{yield Button to="options"}}
          </Items>
        </p.Content>
      {{/if}}

    </HeadlessMenu>
  </Popover>
</template>;

export default Menu;
