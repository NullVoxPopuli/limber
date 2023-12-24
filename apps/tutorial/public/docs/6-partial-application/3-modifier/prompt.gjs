import { on } from '@ember/modifier';
import { cell } from 'ember-resources';

let count = cell(0);
let handler = (event) => count.current++;

<template>
    <button type="button" {{on 'click' handler}}>click me</button>
    <br>Clicked {{count.current}} times
</template>
