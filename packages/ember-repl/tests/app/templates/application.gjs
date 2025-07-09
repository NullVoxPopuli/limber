import { on } from '@ember/modifier';

import { Compiled } from 'ember-repl';
import { cell } from 'ember-resources';

function handleChange(fun) {
  return (event) => {
    fun(event.target.value);
  };
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

const vanilla = cell(`
export default function render(element) {
  element.textContent = 'hello world';
}
`);

const JSDemo = <template>
  <fieldset><legend>js</legend>
    {{#let (cell false) as |show|}}
      {{#if show.current}}
        <textarea
          {{on "change" (handleChange vanilla.set)}}
          style="height: 100px; width: 300px;"
        >{{vanilla.current}}</textarea>

        {{#let (Compiled vanilla.current "js") as |compiled|}}
          {{compiled.error}}
          {{#if compiled.component}}
            <compiled.component />
          {{/if}}
        {{/let}}
      {{else}}
        <button onclick={{show.toggle}}>show</button>
      {{/if}}
    {{/let}}
  </fieldset>
</template>;

const GJSDemo = <template>
  <fieldset><legend>gjs</legend>
    {{#let (cell false) as |show|}}
      {{#if show.current}}
        <textarea
          {{on "change" (handleChange gjs.set)}}
          style="height: 100px; width: 300px;"
        >{{gjs.current}}</textarea>

        {{#let (Compiled gjs.current "gjs") as |compiled|}}
          {{compiled.error}}
          {{#if compiled.component}}
            <compiled.component />
          {{/if}}
        {{/let}}
      {{else}}
        <button onclick={{show.toggle}}>show</button>
      {{/if}}
    {{/let}}
  </fieldset>
</template>;

const MarkdownDemo = <template>
  <fieldset><legend>Markdown</legend>
    {{#let (cell false) as |show|}}
      {{#if show.current}}
        <textarea
          {{on "change" (handleChange md.set)}}
          style="height: 100px; width: 300px;"
        >{{md.current}}</textarea>

        {{#let (Compiled md.current) as |compiled|}}
          {{compiled.error}}
          {{#if compiled.component}}
            <compiled.component />
          {{/if}}
        {{/let}}
      {{else}}
        <button onclick={{show.toggle}}>show</button>
      {{/if}}
    {{/let}}
  </fieldset>
</template>;

<template>
  <a href="/tests">Run Tests in the Browser</a>
  <hr />
  <div style="display: flex; flex-wrap: wrap;">
    <JSDemo />
    <GJSDemo />
    <MarkdownDemo />
  </div>
</template>
