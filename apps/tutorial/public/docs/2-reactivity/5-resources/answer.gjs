import { resource, cell } from 'ember-resources';

const Clock = resource(({ on }) => {
  let time = cell(new Date());
  let interval = setInterval(() => time.current = new Date(), 1000);

  on.cleanup(() => clearInterval(interval));

  return time;
});

<template>
  It is: <time>{{Clock}}</time>
</template>
