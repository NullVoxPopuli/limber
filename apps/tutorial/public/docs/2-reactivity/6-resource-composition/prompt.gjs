import { tracked } from '@glimmer/tracking';
import { resource, resourceFactory } from 'ember-resources';

function Time(ms) {
  return resource(({ on }) => {
    let time = tracked(Date.now());
    let interval = setInterval(() => time.value = Date.now(), ms);

    on.cleanup(() => clearInterval(interval));

    return () => time.value;
  });
}
resourceFactory(Time);

const Clock = resource(({ use }) => {
  /* Add your composition here */
});

const Stopwatch = resource(({ use }) => {
  /* Add your composition here */
});

<template>
  Clock: <time>{{Clock}}</time><br />
  Stopwatch: {{Stopwatch}}
</template>
