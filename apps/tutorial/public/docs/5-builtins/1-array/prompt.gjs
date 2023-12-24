import { array } from '@ember/helper';

let one = 1;
let two = 2;

let formatted = (data) => JSON.stringify(data, null, 2);

<template>
  {{#let one as |data|}}
    <pre><code>{{formatted data}}</code></pre>
  {{/let}}
</template>
