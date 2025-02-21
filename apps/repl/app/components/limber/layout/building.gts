import { service } from 'ember-primitives/helpers/service';

<template>
  {{#let (service "editor") as |editor|}}
    {{#if editor.isCompiling}}
      <div
        class="absolute inset-x-0 top-0 z-20 flex items-center gap-4 bg-gray-100 bg-opacity-95 p-10 text-2xl font-bold text-black shadow"
      >
        <div class="loader h-6 w-6 animate-spin"></div>
        <span>Building...</span>
      </div>
    {{/if}}
  {{/let}}
</template>
