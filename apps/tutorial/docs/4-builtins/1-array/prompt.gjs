let one = 1;
let two = 2;

<template>
  {{#let one as |data|}}
    {{data}}
  {{/let}}
</template>
