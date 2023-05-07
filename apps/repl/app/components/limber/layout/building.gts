import { service } from 'limber-ui';

<template>
  {{#let (service 'editor') as |editor|}}
    {{#if editor.isCompiling}}
      <div
        class='absolute top-0 inset-x-0 bg-opacity-95 p-10 bg-gray-100 shadow text-black text-2xl font-bold z-20 flex gap-4 items-center'
      >
        <div class='loader animate-spin h-6 w-6'></div>
        <span>Building...</span>
      </div>
    {{/if}}
  {{/let}}
</template>
