import { on } from '@ember/modifier';
import { tracked } from '@glimmer/tracking';

let clicks = tracked(0);

function handleClick(mouseEvent) {
  clicks.value++;
}

<template>
  <button type="button" {{on 'click' handleClick}}>
    Click me!
  </button>

  Clicked: {{clicks.value}}
</template>
