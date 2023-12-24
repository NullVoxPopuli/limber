import { on } from '@ember/modifier';
import { cell } from 'ember-resources';

let clicks = cell(0);

function handleClick(mouseEvent) {
  clicks.current++;
}

<template>
  <button type="button" {{on 'click' handleClick once=true}}>
    Click me!
  </button>

  Clicked: {{clicks.current}}
</template>
