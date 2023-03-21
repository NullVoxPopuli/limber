A resource represents a value which may be derived from state and has cleanup.

For example, a resource can increment a number every second:

```gjs
import { resource, cell } from 'ember-resources';

const Counter = resource(({ on }) => {
  let count = cell(0);
  let interval = setInterval(() => count.current++, 1000);

  on.cleanup(() => clearInterval(interval));

  return () => count.current;
});
```

Try rendering the `Counter` like you would any ordinary value:
```gjs
<template>
  Count: {{Counter}}
</template>
```

This `Counter` uses [`setInterval`][mdn-setInterval], which requires that the intervalling behavior is cancelled when `{{Counter}}` is no longer rendered.

```js
  on.cleanup(() => clearInterval(interval));
```

This `on.cleanup` function will be called when `{{Counter}}` is removed from the DOM.



[mdn-setInterval]: https://developer.mozilla.org/en-US/docs/Web/API/setInterval
