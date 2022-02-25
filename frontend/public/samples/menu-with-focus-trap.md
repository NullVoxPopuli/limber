When opening a menu, focus should be trapped, but you also
want the ability to toggle the button to close/open the menu.

More details as well as a tutorial
[here](https://gist.github.com/MelSumner/1e724431bcb3ec666408240a85fa94db)

```gjs live preview
import { on } from '@ember/modifier';

import focusTrap from 'ember-focus-trap/modifiers/focus-trap';
import { PopperJS } from 'ember-popperjs';
import HeadlessMenu from 'ember-headlessui/components/menu';

const Button =
  <template>
    <@item as |item|>
      <item.Element
        @tagName="button"
        class="
          block w-full select-none py-2 px-4 text-left
          focus:ring-4 focus:outline-none
        "
        tabindex="0"
        ...attributes
      >
        {{yield}}
      </item.Element>
    </@item>
  </template>;

<template>
  <HeadlessMenu as |menu|>
    <div {{focusTrap isActive=menu.isOpen}}>
      <PopperJS as |trigger popover|>
        <menu.Button {{trigger}}>
          Toggle Menu
        </menu.Button>

        <menu.Items {{popover}} class="grid gap-3 p-2 shadow-lg z-10 bg-white" as |items|>
          {{#let (component Button item=items.Item) as |Button|}}
            <Button>Option 1</Button>
            <Button>Option 2</Button>
            <Button>Option 3</Button>
          {{/let}}
        </menu.Items>
      </PopperJS>
    </div>
  </HeadlessMenu>
</template>
```
