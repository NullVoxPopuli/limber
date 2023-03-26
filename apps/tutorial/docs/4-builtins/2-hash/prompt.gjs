import { hash } from '@ember/helper';

let formatted = (data) => JSON.stringify(data, null, 2);

<template>
  {{#let 1 as |data|}}
    <pre><code>{{formatted data}}</code></pre>
  {{/let}}
</template>
