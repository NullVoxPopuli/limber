import { resource, cell, resourceFactory } from 'ember-resources';

const Time = resourceFactory((ms) => resource(({ on }) => {
  let time = cell(Date.now());
  let interval = setInterval(() => time.current = Date.now(), ms);

  on.cleanup(() => clearInterval(interval));

  return time;
}));

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
