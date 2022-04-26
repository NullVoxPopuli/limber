import Shadowed from 'limber/components/shadowed';

import service from 'limber/helpers/service';

<template>
  {{#let (service 'editor') as |context|}}
    <Shadowed @omitStyles={{true}} class="border border-gray-900 overflow-hidden" ...attributes>
      <link rel="stylesheet" href="/monaco/editor.main.css">
      <link rel="stylesheet" href="/monaco/preconfigured.css">

      {{!-- template-lint-disable no-inline-styles --}}
      <div
        style="width: 100%; height: 100%;"
        {{@editor
          context.text
          context.updateText
          setValue=context.swapText
        }}
      >{{context.text}}</div>
    </Shadowed>
  {{/let}}
</template>
