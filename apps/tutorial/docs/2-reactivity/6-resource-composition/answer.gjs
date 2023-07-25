import { resource, cell, resourceFactory } from 'ember-resources';

const Time = resourceFactory((ms) => resource(({ on }) => {
  let time = cell(new Date().getTime());
  let interval = setInterval(() => time.current = new Date().getTime(), ms);

  on.cleanup(() => clearInterval(interval));

  return time;
}));


const Clock = resource(({ on, use }) => {
  let time = use(Time(1_000));
  return () => time.current;
});

const Stopwatch = resource(({ on, use }) => {
  let time = use(Time(0));
  return () => time.current;
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
    let time = use(Clock);

    return () => formatter.format(time.current);
  });
});


const Watch = resource(({ on, use }) => {
  let clock = use(Time(1_000));
  let stopwatch = use(Time(0));

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

  {{#let (Watch) as |watch|}}
    watch.currentTime: {{watch.currentTime}}<br>
    watch.currentMs: {{watch.currentMs}}
  {{/let}}
</template>
