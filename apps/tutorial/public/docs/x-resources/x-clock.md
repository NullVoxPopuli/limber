# Clock as a Resource

Resources can maintain encapsulated state and provide a reactive single value.

```gjs live
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { resource } from 'ember-resources';

const Clock = resource(({ on }) => {
  let time = tracked(new Date());
  let interval = setInterval(() => time.value = new Date(), 1000);

  on.cleanup(() => clearInterval(interval));

  let formatter = new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hour12: true,
  });

  return () => formatter.format(time.value);
});

<template>
  It is: <time>{{Clock}}</time>
</template>

```
