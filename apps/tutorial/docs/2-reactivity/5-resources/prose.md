A resource represents a value which may be derived from state and has cleanup.

For example, a resource can show the current time every second:

```gjs
import { resource, cell } from 'ember-resources';

const Clock = resource(({ on }) => {
  let time = cell(new Date());
  let interval = setInterval(() => time.current = new Date(), 1000);

  on.cleanup(() => clearInterval(interval));

  return () => time.current;
});
```

Try rendering the `Clock` like you would any ordinary value:

```gjs
<template>
  It is: <time>{{Clock}}</time>
</template>
```

This `Clock` uses [`setInterval`][mdn-setInterval], which requires that the intervalling behavior is cancelled when `{{Counter}}` is no longer rendered.

```js
on.cleanup(() => clearInterval(interval));
```

This `on.cleanup` function will be called when `{{Clock}}` is removed from the DOM.

[mdn-setInterval]: https://developer.mozilla.org/en-US/docs/Web/API/setInterval
