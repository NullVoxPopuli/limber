import { cell } from 'ember-resources';

const greeting = cell("Hello there!");

// Change the value after 3 seconds
setTimeout(() => {
  greeting.current = "General Kenobi!";
}, 3000);

<template>
  Greeting: {{greeting.current}}
</template>
