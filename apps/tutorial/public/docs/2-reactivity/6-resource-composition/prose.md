Where resources' real power comes in is the composibility of other resources.

In previous chapters, we've built a clock, which updates every second.
But now let's say we also want to make a Stopwatch, but we only want to manage `setInterval` once, we may want to make a Resource with configurable interval milliseconds, like this:

```js
function Time(ms) {
  return resource(({ on }) => {
    let time = cell(Date.now());
    let interval = setInterval(() => time.current = Date.now(), ms);
  
    on.cleanup(() => clearInterval(interval));
  
    return time;
  })
}
resourceFactory(Time); // declare intent to use in a template
```
Learn more about [resourceFactory here](https://github.com/NullVoxPopuli/ember-resources/blob/main/docs/docs/what-is-resourceFactory.md).

This uses the [`Date.now()`][mdn-date] method which gives us millisecond precision and represents the time in milliseconds since January 1, 1970 00:00:00 UTC (the [epoch][ecma-epoch]).


The `on` object is not the only property we have at our disposal.  We are provided a `use` function that allows us to _use_ other resources.

```js 
function FormattedClock(locale = 'en-US') {
  let formatter = new Intl.DateTimeFormat(locale, { /* ... */ });

  return resource(({ on, use }) => {
    const time = use(Time(1_000));

    return () => formatter.format(time.current);
  });
}
resourceFactory(FormattedClock);
```

This allows us to use the same resource to both make a `Clock` as well as a `Stopwatch`
```js
const Clock = resource(({ on, use }) => {
  let time = use(Time(1_000));
  return time;
});

const Stopwatch = resource(({ on, use }) => {
  let time = use(Time(0));
  return time;
});
```

You could even combine these into a single resource -- `use` can be used as many times as you wish.

```js
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
```


[mdn-date]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date
[ecma-epoch]: https://tc39.es/ecma262/multipage/numbers-and-dates.html#sec-time-values-and-time-range

