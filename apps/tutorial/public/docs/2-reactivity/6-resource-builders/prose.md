Combining the concepts of reactive functions and resources allow us to build configurable reactive values with cleanup!

Taking the `Clock` example, we can use a resource builder to allow us to configure how we want the time displayed.

```gjs
import { resource, cell, resourceFactory } from 'ember-resources';

function Clock(locale = 'en-US') {
  let formatter = new Intl.DateTimeFormat(locale, {
    // ...
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
</template>
```

Try invoking `{{Clock}}` with different arguments:

```hbs

It is:
<time>{{Clock 'ko-KO'}}</time><br />
It is:
<time>{{Clock 'ja-JP-u-ca-japanese'}}</time><br />
```

Learn more about [resourceFactory here](https://github.com/NullVoxPopuli/ember-resources/blob/main/docs/docs/what-is-resourceFactory.md).


[mdn-DateTimeFormat]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat
