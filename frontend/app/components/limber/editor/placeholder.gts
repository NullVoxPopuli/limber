import service from 'limber/helpers/service';

<template>
  {{#let (service 'editor') as |context|}}
    <label class="sr-only" for="initial-editor">
      Glimmer + Markdown Code Editor
    </label>

    <textarea
      readonly
      data-test-placeholder
      id="initial-editor"
      spellcheck="false"
      class="w-full h-full bg-gray-800 px-6 py-2 font-sm font-mono text-white"
      ...attributes
    >{{context.text}}</textarea>
  {{/let}}
</template>
