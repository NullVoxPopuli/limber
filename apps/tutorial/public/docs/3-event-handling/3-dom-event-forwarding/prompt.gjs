import { on } from '@ember/modifier';
import { tracked } from '@glimmer/tracking';

let count = tracked(0);

let SomeComponent = <template>
  <button type="button">
    Click me
  </button>
</template>;

function handleClick() {
  count.value++;
}

<template>
  <SomeComponent />

  Clicked {{count.value}} times
</template>
