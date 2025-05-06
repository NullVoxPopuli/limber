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

<template>
  {{#let (Compiled gjs options.gjs) as |compiled|}}
    <pre>{{JSON.stringify compiled}}</pre>
    {{compiled.error}}
    {{#if compiled.component}}
      <compiled.component />
    {{/if}}
  {{/let}}

  {{#let (Compiled md) as |compiled|}}
    <pre>{{JSON.stringify compiled}}</pre>
    {{compiled.error}}
    {{#if compiled.component}}
      <compiled.component />
    {{/if}}
  {{/let}}
</template>
