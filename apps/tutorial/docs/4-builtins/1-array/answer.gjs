let one = 1;
let two = 2;

<template>
  {{#let (array one two) as |data|}}
    {{data}}
  {{/let}}
</template>
