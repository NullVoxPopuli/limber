When opening a menu, focus should be trapped, but you also
want the ability to toggle the button to close/open the menu.

More details as well as a tutorial
[here](https://gist.github.com/MelSumner/1e724431bcb3ec666408240a85fa94db)

```gjs live
import { on } from '@ember/modifier';

import { focusTrap } from 'ember-focus-trap';
import { PortalTargets } from 'ember-primitives/components/portal-targets';
import { Menu } from 'ember-primitives/components/menu';

const options = {
  clickOutsideDeactivates: true,
  allowOutsideClick: true,
};

<template>
  <div>
    <Menu as |m|>
      <div {{focusTrap isActive=m.isOpen focusTrapOptions=options}}>
        <m.Trigger class="trigger">
          Toggle Menu
        </m.Trigger>

        <m.Content class="items" as |c|>
          <c.Item>Item 1</c.Item>
          <c.Item>Item 2</c.Item>
          <c.Separator />
          <c.Item>Item 3</c.Item>
        </m.Content>
      </div>
    </Menu>
  </div>
  <PortalTargets />

  <style>
   .items {
      all: unset;
      min-width: 180px;
      background: #fff;
      color: #111827;
      padding: 8px 0;
      border-radius: 6px;
      border: none;
      font-size: 14px;
      z-index: 10;
      box-shadow: 0 0 #0000, 0 0 #0000, 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
      display: flex;
      flex-direction: column;
    }

    .items [role="menuitem"] {
      all: unset;
      display: block;
      padding: 4px 12px;
      cursor: pointer;
    }

    .items [role="menuitem"]:focus {
      background-color: #f9fafb;
    }

    .items [role="separator"] {
      border-bottom: 1px solid rgb(17 24 39 / 0.1);
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
