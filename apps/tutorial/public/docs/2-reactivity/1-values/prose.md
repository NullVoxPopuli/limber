A reactive value is an object representing a value with some utility methods for updating that value.

```gjs
import { cell } from 'ember-resources';

const greeting = cell();

<template>
  {{greeting.current}}
</template>
```

In this particular example, we use the [`cell`][gh-cell] primitive from [ember-resources][gh-resources].  
`cell` provides a single property, `current`, that represents the current value.

For this exercise, **change the value after 3 seconds have passed after render**.

`cell` has several update methods that could be used for this task:

- `set` - immediately sets the value of `current`
- `update` - invokes a passed function that receives the previous value and then sets `current` to the return value of that function
- `toggle` - toggles the value between true and false
- and directly setting current via `greeting.current = newValue`

Hint: you may want [setTimeout][mdn-setTimeout].

[gh-cell]: https://github.com/NullVoxPopuli/ember-resources/blob/98ee38186a39097465ca97a90a68b9af158e75b2/ember-resources/src/util/cell.ts#L78
[gh-resources]: https://github.com/NullVoxPopuli/ember-resources
[mdn-setTimeout]: https://developer.mozilla.org/en-US/docs/Web/API/setTimeout
