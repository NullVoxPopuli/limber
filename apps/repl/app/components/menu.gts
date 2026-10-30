import { focusTrap } from 'ember-focus-trap';
import { Key } from 'ember-primitives/components/keys';
import { Menu as HeadlessMenu } from 'ember-primitives/components/menu';
import { FloatingUI } from 'ember-primitives/floating-ui';

import type { TOC } from '@ember/component/template-only';
import type { ComponentLike, WithBoundArgs } from '@glint/template';
import type { ItemSignature, Signature as MenuSignature } from 'ember-primitives/components/menu';

type MenuType = MenuSignature['Blocks']['default'][0];

const keyboardHelp = {
  crossAxis: -8,
};

const focusTrapOptions = {
  clickOutsideDeactivates: true,
  allowOutsideClick: true,
};

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
    class="px-4 py-2 block w-full bg-transparent text-left text-[var(--limber-text)] select-none ring-inset hover:bg-[var(--limber-surface-hover)] focus:ring-4 focus:outline-none"
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
    class="ring-ember-brand -my-1 rounded px-2 py-1 drop-shadow-md ease-in-out hover:drop-shadow-xl sm:text-sm border border-[var(--limber-border)] bg-[var(--limber-surface)] text-left text-[var(--limber-text)] transition duration-150 focus:ring-4 focus:outline-none focus-visible:outline-none"
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
    @placement="bottom"
    @offsetOptions={{8}}
    @shiftOptions={{hash padding=8}}
    @flipOptions={{hash padding=8}}
    as |menu|
  >
    <div {{focusTrap isActive=menu.isOpen focusTrapOptions=focusTrapOptions}}>
      {{yield
        (hash
          menu=menu
          isOpen=menu.isOpen
          Button=(component PlainTrigger menu=menu)
          Default=(component DefaultTrigger menu=menu)
        )
        to="trigger"
      }}
      <FloatingUI as |reference floating|>
        <menu.Content data-test-menu-items {{reference}} class="limber__menu__content" as |content|>
          <div
            class="border border-[var(--limber-border)]"
            style="
        position: absolute;
        background: var(--limber-surface);
        width: 8px;
        height: 8px;
        transform: rotate(45deg);
        z-index: 0;
      "
            {{menu.arrow}}
          ></div>

          <div
            class="rounded drop-shadow-xl grid max-h-[80dvh] min-w-max overflow-auto border border-[var(--limber-border)] bg-[var(--limber-surface)]"
          >
            {{yield (component Button content=content) to="options"}}
          </div>

        </menu.Content>
        {{#if menu.isOpen}}
          <div
            class="menu__keyboard__help"
            {{floating placement="bottom-end" offsetOptions=keyboardHelp}}
          >press <Key>esc</Key> to close</div>
        {{/if}}
      </FloatingUI>

    </div>
  </HeadlessMenu>
</template>;

export default Menu;
