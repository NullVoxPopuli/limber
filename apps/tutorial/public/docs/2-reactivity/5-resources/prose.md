A resource represents a value which may be derived from state and has cleanup.

For example, a resource can show the current time every second:

```gjs
import { tracked } from '@glimmer/tracking';
import { resource } from 'ember-resources';

const Clock = resource(({ on }) => {
  let time = tracked(new Date());
  let interval = setInterval(() => time.value = new Date(), 1000);

  on.cleanup(() => clearInterval(interval));

  return () => time.value;
});
```

Try rendering the `Clock` like you would any ordinary value:

```gjs
<template>
  It is: <time>{{Clock}}</time>
</template>
```

This `Clock` uses [`setInterval`][mdn-setInterval], which requires that the interval is cancelled when `{{Clock}}` is no longer rendered:

```js
on.cleanup(() => clearInterval(interval));
```

This `on.cleanup` function will be called when `{{Clock}}` is removed from the DOM.

[mdn-setInterval]: https://developer.mozilla.org/en-US/docs/Web/API/setInterval
