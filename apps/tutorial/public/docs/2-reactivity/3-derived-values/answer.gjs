import { tracked } from '@glimmer/tracking';

class Demo {
  @tracked greeting = 'Hello there!';

  get loudGreeting() {
    return this.greeting.toUpperCase();
  }
}

const demo = new Demo();

// Change the value after 3 seconds
setTimeout(() => {
  demo.greeting = "General Kenobi!";
}, 3000);

<template>
  Greeting: {{demo.loudGreeting}}
</template>
