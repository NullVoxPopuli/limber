let data = "Hello there!";
let upper = (text) => text.toUpperCase();

<template>
  {{#let data as |greeting|}}
    {{greeting}}
  {{/let}}

  {{#let (upper data) as |greeting|}}
    {{greeting}}
  {{/let}}
</template>
