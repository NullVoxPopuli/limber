import { tracked } from '@glimmer/tracking';
import { resource } from 'ember-resources';

const Clock = resource(({ on }) => {
  let time = tracked(new Date());
  let interval = setInterval(() => time.value = new Date(), 1000);

  on.cleanup(() => clearInterval(interval));

  return () => time.value;
});

<template>
  It is: <time>{{Clock}}</time>
</template>
