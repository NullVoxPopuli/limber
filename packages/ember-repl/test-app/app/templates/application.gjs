import { on } from '@ember/modifier';

import { Compiled } from 'ember-repl';
import { cell } from 'ember-resources';

function handleChange(fun) {
  return (event) => {
    fun(event.target.value);
  }
}

const gjs = cell(`
<template>
  hello there!
</template>
`);

const md = cell(`
# Title

**emphasis** text
`);

const GJSDemo = <template>
  <fieldset><legend>gjs</legend>
    <textarea {{on 'change' (handleChange gjs.set)}} style="height: 100px; width: 300px;">{{gjs.current}}</textarea>

  {{#let (Compiled gjs.current "gjs") as |compiled|}}
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
  <textarea {{on 'change' (handleChange md.set)}} style="height: 100px; width: 300px;">{{md.current}}</textarea>

  {{#let (Compiled md.current) as |compiled|}}
    <pre>{{JSON.stringify compiled}}</pre>
    {{compiled.error}}
    {{#if compiled.component}}
      <compiled.component />
    {{/if}}
  {{/let}}
    </fieldset>
</template>;

<template>
  <div style="display: flex; flex-wrap: wrap;">
    <GJSDemo />
    <MarkdownDemo />
  </div>
</template>
