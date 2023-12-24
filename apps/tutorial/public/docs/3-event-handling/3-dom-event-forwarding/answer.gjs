import { on } from '@ember/modifier';
import { cell } from 'ember-resources';

let count = cell(0);

let SomeComponent = <template>
  <button ...attributes>
    Click me
  </button>
</template>;

function handleClick() {
  count.current++;
}

<template>
  <SomeComponent {{on 'click' handleClick}} />

  Clicked {{count.current}} times
</template>
