import { tracked } from '@glimmer/tracking';

let count = tracked(0);
let handler = (event) => count.value++;

<template>
    <button type="button" {{on 'click' handler}}>click me</button>
    <br>Clicked {{count.value}} times
</template>
