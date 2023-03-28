let Greeting = <template>
  Hello {{@name}}!<br>

  {{@response}}
</template>;

<template>
  {{#let (component Greeting response="General Kenobi!") as |preWired|}}

    <preWired @name="there" />

  {{/let}}
</template>
