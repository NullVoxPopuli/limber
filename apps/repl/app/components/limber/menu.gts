// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore-expect-error
import { hash } from '@ember/helper';

import { focusTrap } from 'ember-focus-trap';
import { Menu as HeadlessMenu } from 'ember-primitives/components/menu';

import type { TOC } from '@ember/component/template-only';
import type { ComponentLike, WithBoundArgs } from '@glint/template';
import type { ItemSignature, Signature as MenuSignature } from 'ember-primitives/components/menu';

type MenuType = MenuSignature['Blocks']['default'][0];

const Button: TOC<{
  Element: HTMLButtonElement;
  Args: {
    content: { Item: ComponentLike<ItemSignature> };
  };
  Blocks: {
    default: [];
  };
}> = <template>
  <@content.Item
    class="bg-transparent block w-full select-none py-2 px-4 text-left text-black hover:bg-gray-100 focus:ring-4 ring-inset focus:outline-none"
    tabindex="0"
    data-test-menu-button
    ...attributes
  >
    {{yield}}
  </@content.Item>
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
    menu: MenuType;
  };
  Blocks: {
    default: [MenuType];
  };
}> = <template>
  <@menu.Trigger ...attributes>
    {{yield @menu}}
  </@menu.Trigger>
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
    options: [button: WithBoundArgs<typeof Button, 'content'>];
  };
}> = <template>
  <HeadlessMenu
    @inline={{@inline}}
    @placement="bottom"
    @offsetOptions={{8}}
    @shiftOptions={{hash padding=8}}
    @flipOptions={{hash padding=8}}
    as |menu|
  >
    <div>
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
      <menu.Content
        {{focusTrap isActive=menu.isOpen}}
        data-test-menu-items
        class="z-20 grid rounded border bg-white drop-shadow-xl min-w-max"
        style="width: max-content;z-index:1;"
        as |content|
      >
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

        {{yield (component Button content=content) to="options"}}

      </menu.Content>
    </div>
  </HeadlessMenu>
</template>;

export default Menu;
