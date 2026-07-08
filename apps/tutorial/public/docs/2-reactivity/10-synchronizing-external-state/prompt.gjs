import { on } from '@ember/modifier';
import { tracked } from '@glimmer/tracking';

const title = tracked("hello");
const update = (event) => title.value = event.target.value;

function logInput(...args) {
    console.log(title.value, ...args);
}

<template>
  {{! invoke logInput here: }}

  <input value={{title.value}} {{on 'input' update}}>
  <style>
    input { border: 1px solid; }
  </style>
</template>
