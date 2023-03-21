Deriving values are automatically reactive and allow for CPU-efficient transformation of other values.

Another way of saying "X" is defined as "some transformation" on "Y".

In Glimmer and Ember, it is convention to use a [getter][mdn-get].
Using our previous example,
```js
import { tracked } from '@glimmer/tracking';

class Demo {
  @tracked greeting = 'Hello there!';

  get loudGreeting() {
    return this.greeting.toUpperCase();
  }
}
```

The getter, `loudGreeting` will always be up to date.

[mdn-get]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/get
