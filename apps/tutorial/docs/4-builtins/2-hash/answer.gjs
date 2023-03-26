import { hash } from '@ember/helper';

let formatted = (data) => JSON.stringify(data, null, 2);

<template>
  {{#let (hash one=1 two=2) as |data|}}
    <pre><code>{{formatted data}}</code></pre>
  {{/let}}
</template>
