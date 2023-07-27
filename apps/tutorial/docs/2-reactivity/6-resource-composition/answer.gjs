import { resource, cell, resourceFactory } from 'ember-resources';

const Time = resourceFactory((ms) => resource(({ on }) => {
  let time = cell(Date.now());
  let interval = setInterval(() => time.current = Date.now(), ms);

  on.cleanup(() => clearInterval(interval));

  return time;
}));

const Clock = resource(({ use }) => {
  return use(Time(1_000));
});

const Stopwatch = resource(({ use }) => {
  return use(Time(0));
});

// from a previous example
const FormattedClock = resourceFactory((locale = 'en-US') => {
  let formatter = new Intl.DateTimeFormat(locale, {
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hour12: true,
  });

  return resource(({ use }) => {
    let time = use(Clock);

    return () => formatter.format(time.current);
  });
});

// demonstrating that use can be used multiple times
const Watch = resource(({ use }) => {
  let clock = use(Time(1_000));
  let stopwatch = use(Time(0));

  // alternative way to have reactive properties
  return {
    get currentTime() {
      return clock.current;
    },
    get currentMs() {
      return stopwatch.current;
    }
  };
});

<template>
  Go! {{Stopwatch}} (ms since the epoch) <br />
  It is: <time>{{Clock}}</time><br />
  It is: <time>{{FormattedClock}}</time><br />
  It is: <time>{{FormattedClock 'en-GB'}}</time><br />
  It is: <time>{{FormattedClock 'ko-KO'}}</time><br />
  It is: <time>{{FormattedClock 'ja-JP-u-ca-japanese'}}</time><br>
  <br>

  {{#let (Watch) as |watch|}}
    watch.currentTime: {{watch.currentTime}}<br>
    watch.currentMs: {{watch.currentMs}}
  {{/let}}
</template>
