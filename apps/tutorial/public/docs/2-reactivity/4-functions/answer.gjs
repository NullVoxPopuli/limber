import { tracked } from '@glimmer/tracking';

const greeting = tracked("Hello there!");
const shout = (text) => text.toUpperCase();

// Change the value after 3 seconds
setTimeout(() => {
  greeting.value = "General Kenobi!";
}, 3000);

<template>
  Greeting: {{ (shout greeting.value) }}
</template>
