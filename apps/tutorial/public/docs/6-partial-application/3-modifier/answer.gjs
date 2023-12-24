import { on } from '@ember/modifier';
import { cell } from 'ember-resources';

let count = cell(0);
let handler = (event) => count.current++;

<template>
  {{#let (modifier on 'click' handler) as |preWired|}}
    <button type="button" {{preWired}}>click me</button>
    <br>Clicked {{count.current}} times
  {{/let}}
</template>
