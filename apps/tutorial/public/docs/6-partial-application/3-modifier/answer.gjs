import { tracked } from '@glimmer/tracking';

let count = tracked(0);
let handler = (event) => count.value++;

<template>
  {{#let (modifier on 'click' handler) as |preWired|}}
    <button type="button" {{preWired}}>click me</button>
    <br>Clicked {{count.value}} times
  {{/let}}
</template>
