import { array } from '@ember/helper';

let one = 1;
let two = 2;

let formatted = (data) => JSON.stringify(data, null, 2);

<template>
  {{#let (array one two) as |data|}}
    <pre><code>{{formatted data}}</code></pre>
  {{/let}}
</template>
