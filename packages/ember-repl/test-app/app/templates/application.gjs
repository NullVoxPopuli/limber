import { Compiled } from 'ember-repl';

const options = {
  gjs: {
    format: 'gjs'
  }
}

const gjs = `
<template>
  hello there!
</template>
`;

const md = `
# Title

**emphasis** text
`;

const GJSDemo = <template>
  <fieldset><legend>gjs</legend>
  {{#let (Compiled @input options.gjs) as |compiled|}}
    <pre>{{JSON.stringify compiled}}</pre>
    {{compiled.error}}
    {{#if compiled.component}}
      <compiled.component />
    {{/if}}
  {{/let}}
    </fieldset>
</template>;

const MarkdownDemo = <template>
<fieldset><legend>Markdown</legend>
  {{#let (Compiled @input) as |compiled|}}
    <pre>{{JSON.stringify compiled}}</pre>
    {{compiled.error}}
    {{#if compiled.component}}
      <compiled.component />
    {{/if}}
  {{/let}}
    </fieldset>
</template>;

<template>
  <GJSDemo @input={{gjs}} />
  <MarkdownDemo @input={{md}} />
</template>
