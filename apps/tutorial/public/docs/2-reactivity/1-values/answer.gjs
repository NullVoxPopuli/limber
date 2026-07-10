import { tracked } from '@glimmer/tracking';

const greeting = tracked("Hello there!");

// Change the value after 3 seconds
setTimeout(() => {
  greeting.value = "General Kenobi!";
}, 3000);

<template>
  Greeting: {{greeting.value}}
</template>
