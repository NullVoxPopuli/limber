const Greeting = <template>
  <div ...attributes>{{@greeting}}</div>
</template>;

const CurriedComponent = <template>
  <Greeting class="greeting" @greeting={{@greeting}} />
  <style>
    .greeting {
      color: red;
    }
  </style>
</template>;

const Demo = <template>
  {{yield (component CurriedComponent greeting="hello there")}}
</template>;

<template>
  <Demo as |Curried|>
    <Curried />
  </Demo>
</template>
