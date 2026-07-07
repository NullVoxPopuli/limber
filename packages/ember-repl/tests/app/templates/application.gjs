import { tracked } from '@glimmer/tracking';
import { on } from '@ember/modifier';

import { Compiled } from 'ember-repl';

function handleChange(fun) {
  return (event) => {
    fun(event.target.value);
  };
}

const gjs = tracked(`
<template>
  hello there!
</template>
`);

const md = tracked(`
# Title

**emphasis** text
`);

const GJSDemo = <template>
  <fieldset><legend>gjs</legend>
    <textarea
      {{on "change" (handleChange gjs.set)}}
      style="height: 100px; width: 300px;"
    >{{gjs.value}}</textarea>

    {{#let (Compiled gjs.value "gjs") as |compiled|}}
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
    <textarea
      {{on "change" (handleChange md.set)}}
      style="height: 100px; width: 300px;"
    >{{md.value}}</textarea>

    {{#let (Compiled md.value) as |compiled|}}
      <pre>{{JSON.stringify compiled}}</pre>
      {{compiled.error}}
      {{#if compiled.component}}
        <compiled.component />
      {{/if}}
    {{/let}}
  </fieldset>
</template>;

<template>
  <a href="/tests">Run Tests in the Browser</a>
  <hr />
  <div style="display: flex; flex-wrap: wrap;">
    <GJSDemo />
    <MarkdownDemo />
  </div>
</template>
