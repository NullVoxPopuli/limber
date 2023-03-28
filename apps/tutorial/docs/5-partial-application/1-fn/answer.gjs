import { fn } from '@ember/helper';

let stringify = (data) => JSON.stringify(data, null, 3);
let data = { a: 'A', b: 'B' };

<template>
  {{#let (fn stringify data) as |preWired|}}
    <pre><code>{{ (preWired) }}</code></pre>
  {{/let}}
</template>
