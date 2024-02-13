const Conditional = <template>
  <div class="block-layout">
    {{#if (has-block "blue")}}
      <div class="blue">
        {{yield to="blue"}}
      </div>
    {{/if}}

    <div class="red">
      {{yield to="default"}}
    </div>
  </div>

  <style>
    .block-layout {
      border: 1px solid black;
      padding: 0.5rem;
      display: grid;
      gap: 0.5rem;

      .red { border: 1px solid red; }
      .blue { border: 1px solid blue; }
      .red, .blue { padding: 0.5rem; }
    }
  </style>
</template>;

<template>
  <div class="layout">
    <Conditional>
      Default content. Only the red box shows.
      The blue box should not be rendered.
    </Conditional>

    <Conditional>
      <:blue>
        Shows up in blue
      </:blue>
      <:default>
        Content for :default shows up in red
      </:default>
    </Conditional>
  </div>

  <style>
    .layout {
      display: grid;
      gap: 1rem;
    }
  </style>
</template>
