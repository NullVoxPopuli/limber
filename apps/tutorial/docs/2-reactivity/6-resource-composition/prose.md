Where resources' real power comes in is the composibility of other resources.

Going back to our simple `Clock` example, we may want to re-use the `Clock` in a variety of ways.
Conceptually, we have a _value_ that represents the current time.

```js
const Clock = resource(({ on }) => {
  /* ... */
  return time;
});
```

The `on` object is not the only property we have at our disposal.  We are provided a `use` function that allows us to _use_ other resources.

```js 
const FormattedClock = resourceFactory((locale = 'en-US') => {
  let formatter = new Intl.DateTimeFormat(locale, { /* ... */ });

  return resource(({ on, use }) => {
    const time = use(Clock);

    return () => formatter.format(time.current);
  });
});
```


We could also compose with parameterized resources, allowing even more flexibility.

```js
const Time = resourceFactory((ms) => resource(({ on }) => {
  let time = cell(new Date().getTime());
  let interval = setInterval(() => time.current = new Date().getTime(), ms);

  on.cleanup(() => clearInterval(interval));

  return time;
});
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

