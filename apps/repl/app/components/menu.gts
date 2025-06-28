import { hash } from '@ember/helper';

// @ts-expect-error - they still don't have types
import { focusTrap } from 'ember-focus-trap';
import { Menu as HeadlessMenu } from 'ember-primitives/components/menu';

import { GlobalHint } from './global-hint.gts';

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
    class="block w-full select-none bg-transparent px-4 py-2 text-left text-black ring-inset hover:bg-gray-100 focus:outline-none focus:ring-4"
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
    class="ring-ember-brand -my-1 rounded border bg-white px-2 py-1 text-left text-black drop-shadow-md transition duration-150 ease-in-out hover:drop-shadow-xl focus:outline-none focus:ring-4 focus-visible:outline-none sm:text-sm"
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
    {{! focusTrap doesn't work unless inline is set }}
    @inline={{true}}
    @placement="bottom"
    @offsetOptions={{8}}
    @shiftOptions={{hash padding=8}}
    @flipOptions={{hash padding=8}}
    as |menu|
  >
    <div {{focusTrap isActive=menu.isOpen}}>
      {{yield
        (hash
          menu=menu
          isOpen=menu.isOpen
          Button=(component PlainTrigger menu=menu)
          Default=(component DefaultTrigger menu=menu)
        )
        to="trigger"
      }}

      <menu.Content data-test-menu-items class="limber__menu__content" as |content|>
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

        <div
          class="grid max-h-[80dvh] min-w-max overflow-auto rounded border bg-white drop-shadow-xl"
        >
          {{yield (component Button content=content) to="options"}}
        </div>

      </menu.Content>

      {{#if menu.isOpen}}
        <GlobalHint>
          <div>Press <kbd>esc</kbd> to close</div>
        </GlobalHint>
      {{/if}}
    </div>
  </HeadlessMenu>
</template>;

export default Menu;
