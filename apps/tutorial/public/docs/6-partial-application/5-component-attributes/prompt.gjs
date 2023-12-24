const Greeting = <template>
  <div ...attributes>{{@greeting}}</div>
</template>;

/* implement attribute currying here */

const Demo = <template>
  {{yield (component Greeting greeting="hello there")}}
</template>;

<template>
  <Demo as |Curried|>
    <Curried />
  </Demo>
</template>
