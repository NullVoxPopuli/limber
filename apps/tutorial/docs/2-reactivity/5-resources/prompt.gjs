import { resource, cell } from 'ember-resources';

const Counter = resource(({ on }) => {
  let time = cell(new Date());
  let interval = setInterval(() => time.current = new Date(), 1000);

  on.cleanup(() => clearInterval(interval));

  return () => time.current;
});

<template>

</template>
