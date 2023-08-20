When opening a menu, focus should be trapped, but you also
want the ability to toggle the button to close/open the menu.

More details as well as a tutorial
[here](https://gist.github.com/MelSumner/1e724431bcb3ec666408240a85fa94db)

```gjs live preview
import { on } from '@ember/modifier';

import focusTrap from 'ember-focus-trap/modifiers/focus-trap';
import { Popover } from 'ember-primitives';
import HeadlessMenu from 'ember-headlessui/components/menu';

const Button =
  <template>
    <@item as |item|>
      <item.Element @tagName="button" class="btn-item" tabindex="0" ...attributes>
        {{yield}}
      </item.Element>
    </@item>
  </template>;

<template>
  <HeadlessMenu as |menu|>
    <div {{focusTrap isActive=menu.isOpen}}>
      <Popover @inline={{true}} as |x|>
        <menu.Button {{x.hook}}>
          Toggle Menu
        </menu.Button>

        {{#if menu.isOpen}}
          <x.Content style="z-index: 1">
            <div class="arrow" {{x.arrow}}></div>

            <menu.Items class="items" as |items|>
              {{#let (component Button item=items.Item) as |Button|}}
                <Button>Option 1</Button>
                <Button>Option 2</Button>
                <Button>Option 3</Button>
              {{/let}}
            </menu.Items>
          </x.Content>
        {{/if}}
      </Popover>
    </div>
  </HeadlessMenu>

  <style>
    .btn-item {
      display: block;
      width: 100%;
      user-select: none;
      padding: 0.5rem 1rem;
      text-align: left;
    }
    .btn-item:focus {
      --tw-ring-offset-shadow: var(--tw-ring-inset) 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color);
      --tw-ring-shadow: var(--tw-ring-inset) 0 0 0 calc(4px + var(--tw-ring-offset-width)) var(--tw-ring-color);
      box-shadow: var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow, 0 0 #0000);
      outline: 2px solid transparent;
      outline-offset: 2px;
    }
    .items {
      display: grid;
      gap: 0.75rem;
      padding: 0.5rem;
      background: white;
      --tw-drop-shadow: drop-shadow(0 20px 13px rgb(0 0 0 / 0.03)) drop-shadow(0 8px 5px rgb(0 0 0 / 0.08));
      filter: var(--tw-blur) var(--tw-brightness) var(--tw-contrast) var(--tw-grayscale) var(--tw-hue-rotate) var(--tw-invert) var(--tw-saturate) var(--tw-sepia) var(--tw-drop-shadow);
    }
    .arrow {
      position: absolute;
      background: white;
      border: 1px;
      width: 8px;
      height: 8px;
      transform: rotate(45deg);
      z-index: 0;
    }
  </style>
</template>
```
