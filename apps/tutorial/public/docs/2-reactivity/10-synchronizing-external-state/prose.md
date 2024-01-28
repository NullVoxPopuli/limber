Synchronizing state outside of the framework can be common, depending on your application-specific needs.

You've already learned how functions are automatically invoked when they access `@tracked` data (whether directly in a `cell`, or abstracted with the `@tracked` decorator).

So this knowledge can be used to create an auto-tracking side-effect, and we can re-implement the built-in [`{{log}}`][docs-log] helper.

```gjs
const title = cell("hello");

function logInput(...args) {
    console.log(title.current, ...args);
}

<template>
  {{ (logInput "passed" "args") }}
</template>
```

Most importantly, there are some things we should keep in mind when calling functions:
- We don't want to `return` a value, else that value will render - this includes marking the function as `async`, which inherently returns a `Promise`
- `@tracked` data may not be mutated / set in these functions because setting `@tracked` data causes other parts of the UI to re-render, and because functions auto-track, they would detect the change to that tracked-data, and then re-run, setting the data again, causing an infinite rendering loop.
- Functions may often serve a similar purpose to getters as used in class-components: for deriving data.

[docs-log]: https://api.emberjs.com/ember/release/classes/Ember.Templates.helpers/methods/log?anchor=log

