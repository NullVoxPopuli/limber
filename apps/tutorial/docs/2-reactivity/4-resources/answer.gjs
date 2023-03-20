import { resource, cell } from 'ember-resources';

const Counter = resource(({ on }) => {
  let count = cell(0);
  let interval = setInterval(() => count.current++, 1000);

  on.cleanup(() => clearInterval(interval));

  return () => count.current;
});

<template>
  Count: {{Counter}}
</template>
