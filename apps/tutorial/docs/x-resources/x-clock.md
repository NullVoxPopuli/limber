# Clock as a Resource

Resources can maintain encapsulated state and provide a reactive single value.

```gjs live
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { resource, cell } from 'ember-resources';

const Clock = resource(({ on }) => {
  let time = cell(new Date());
  let interval = setInterval(() => time.current = new Date(), 1000);

  on.cleanup(() => clearInterval(interval));

  let formatter = new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hour12: true,
  });

  return () => formatter.format(time.current);
});

<template>
  It is: <time>{{Clock}}</time>
</template>

```
