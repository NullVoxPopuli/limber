import { resource, cell, resourceFactory } from 'ember-resources';

function Time(ms) {
  return resource(({ on }) => {
    let time = cell(Date.now());
    let interval = setInterval(() => time.current = Date.now(), ms);

    on.cleanup(() => clearInterval(interval));

    return time;
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
