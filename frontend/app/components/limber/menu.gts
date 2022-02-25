import HeadlessMenu from 'ember-headlessui/components/menu';
import { PopperJS } from 'ember-popperjs';

const Button = <template>
  <@item as |item|>
    <item.Element
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
    </item.Element>
  </@item>
</template>;

<template>
  <HeadlessMenu ...attributes as |menu|>
    <PopperJS as |trigger popover|>
      <menu.Button
        {{trigger}}
        class="
          text-black
          rounded-sm border border-gray-900 bg-white px-2 py-1 -my-1 text-left
          transition ease-in-out duration-150 sm:text-sm
          focus:ring-4 focus-visible:outline-none ring-ember-brand focus:outline-none
        "
        ...attributes
      >
        {{yield menu to="trigger"}}
      </menu.Button>
      <menu.Items
        {{popover}}
        class="absolute top-2 z-20 grid mt-1 rounded-sm bg-white shadow-lg min-w-max"
        data-test-menu-items
        as |items|
      >
        {{yield (component Button item=items.Item) to="options"}}
      </menu.Items>
    </PopperJS>
  </HeadlessMenu>
</template>
