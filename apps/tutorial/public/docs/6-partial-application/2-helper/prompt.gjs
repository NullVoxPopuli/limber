import Helper from '@ember/component/helper';

class DemoHelper extends Helper {
  compute(positionalArgs, namedArgs) {
    return JSON.stringify({ positionalArgs, namedArgs }, null, 3);
  }
}

let data = { a: 'A', b: 'B' };

<template>
  {{#let DemoHelper as |preWired|}}
    <pre><code>{{ (preWired) }}</code></pre>
  {{/let}}
</template>
