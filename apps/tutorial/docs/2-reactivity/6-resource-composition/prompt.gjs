import { resource, cell, resourceFactory } from 'ember-resources';

const Clock = resource(({ on }) => {
  let time = cell(new Date());
  let interval = setInterval(() => time.current = new Date(), 1000);

  on.cleanup(() => clearInterval(interval));

  return time;
});

const FormattedClock = resourceFactory((locale = 'en-US') => {
  let formatter = new Intl.DateTimeFormat(locale, {
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hour12: true,
  });

  return resource(({ on, use }) => {

  });
});

<template>
  It is: <time>{{FormattedClock}}</time><br />
  It is: <time>{{FormattedClock 'en-GB'}}</time><br />
  It is: <time>{{FormattedClock 'ko-KO'}}</time><br />
  It is: <time>{{FormattedClock 'ja-JP-u-ca-japanese'}}</time>
</template>
