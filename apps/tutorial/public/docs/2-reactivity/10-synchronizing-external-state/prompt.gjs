import { on } from '@ember/modifier';
import { cell } from 'ember-resources';

const title = cell("hello");
const update = (event) => title.current = event.target.value;

function logInput(...args) {
    console.log(title.current, ...args);
}

<template>
  {{! invoke logInput here: }}

  <input value={{title.current}} {{on 'input' update}}>
  <style>
    input { border: 1px solid; }
  </style>
</template>
