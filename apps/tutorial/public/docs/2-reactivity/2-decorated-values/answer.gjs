import { tracked } from '@glimmer/tracking';

class Demo {
  @tracked greeting = 'Hello there!';
}

const demo = new Demo();

// Change the value after 3 seconds
setTimeout(() => {
  demo.greeting = "General Kenobi!";
}, 3000);

<template>
  Greeting: {{demo.greeting}}
</template>
