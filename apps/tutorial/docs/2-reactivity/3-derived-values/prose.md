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

Something to watch out for is property assignments in classes,

```js
class Demo {
  @tracked greeting = 'Hello there!';

  loudGreeting = this.greeting.toUpperCase();
}
```

This is explicitly _non-reactive_, because property assignments in classes only happen once.
For more information on class fields, [MDN has good content on the subject][mdn-class-fields].

[mdn-get]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/get
[mdn-class-fields]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/Public_class_fields
