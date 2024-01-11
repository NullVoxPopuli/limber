import { resource, cell, resourceFactory } from 'ember-resources';

function Clock(locale = 'en-US') {
  let formatter = new Intl.DateTimeFormat(locale, {
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hour12: true,
  });

  return resource(({ on }) => {
    let time = cell(new Date());
    let interval = setInterval(() => time.current = new Date(), 1000);

    on.cleanup(() => clearInterval(interval));

    return () => formatter.format(time.current);
  });
}

resourceFactory(Clock);

<template>
  It is: <time>{{Clock}}</time><br />
  It is: <time>{{Clock 'en-GB'}}</time><br />
  It is: <time>{{Clock 'ko-KO'}}</time><br />
  It is: <time>{{Clock 'ja-JP-u-ca-japanese'}}</time>
</template>
