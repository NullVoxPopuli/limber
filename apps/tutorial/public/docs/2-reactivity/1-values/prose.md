A reactive value is an object representing a value with some utility methods for updating that value.

```gjs
import { tracked } from '@glimmer/tracking';

const greeting = tracked('Hello World');

<template>
  {{greeting.value}}
</template>
```

In this particular example, we use the [`tracked`][api-tracked] function from `@glimmer/tracking`, built in to Ember.
`tracked` provides a single property, `value`, that represents the current value.
Note that `tracked` must be given an initial value.

For this exercise, **change the value after 3 seconds have passed after render**.

`tracked` has several update methods that could be used for this task:

- `set` - immediately sets the value of `value`
- `update` - invokes a passed function that receives the previous value and then sets `value` to the return value of that function
- and directly setting the value via `greeting.value = newValue`

Hint: you may want [setTimeout][mdn-setTimeout].

[api-tracked]: https://api.emberjs.com/ember/release/functions/@glimmer%2Ftracking/tracked
[mdn-setTimeout]: https://developer.mozilla.org/en-US/docs/Web/API/setTimeout
