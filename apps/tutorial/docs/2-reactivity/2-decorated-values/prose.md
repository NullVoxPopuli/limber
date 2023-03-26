As one might imagine, having to access and manipulating a property can get cumbersome.

If using classes, you could see a pattern develop to try to achieve "native-like" read and write access to properties:

```js
import { cell } from 'ember-resources';

class Demo {
  _value = cell();

  get theProperty() {
    return this._value.current;
  }

  set theProperty(nextValue) {
    return (this._value.current = nextValue);
  }
}
```

This would allow setting / getting of `theProperty`, which is reactive, without thet need to know about the underlying reactive implementation. _Except, you'd still have to maintain all of the above code_.

```gjs
const demo = new Demo();

setTimeout(() => {
  demo.theProperty = 2;
}, 500);

<template>
  {{demo.theProperty}}
</template>
```

All of this is abstracted away with a _property decorator_, called `@tracked`, and the above example can be simplified like so:

```js
import { tracked } from '@glimmer/tracking';

class Demo {
  @tracked theProperty;
}
```

This decorator automatically wraps up the getter and setter so that the _reference_ to `theProperty` is reactive, and can be set / updated like normal javascript properties.

**For this exercise, re-write the previous example using `@tracked`**

You'll notice that _for now_ you still have to manage a special object. We'll circle back to that later when we talk about _components_.
