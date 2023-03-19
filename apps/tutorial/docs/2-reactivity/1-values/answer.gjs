import { cell } from 'ember-resources';

const theValue = cell("Hello there!");

// Change the value after 3 seconds
setTimeout(() => {
  theValue.current = "General Kenobi!";
}, 3000);

<template>
  Greeting: {{theValue.current}}
</template>
