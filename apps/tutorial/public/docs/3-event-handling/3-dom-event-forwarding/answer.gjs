import { on } from '@ember/modifier';
import { tracked } from '@glimmer/tracking';

let count = tracked(0);

let SomeComponent = <template>
  <button ...attributes type="button">
    Click me
  </button>
</template>;

function handleClick() {
  count.value++;
}

<template>
  <SomeComponent {{on 'click' handleClick}} />

  Clicked {{count.value}} times
</template>
