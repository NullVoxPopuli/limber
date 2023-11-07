A function can transform any data from a template.

Let's try defining a function

```gjs
let name = "world";
let shout = (text) => text.toUpperCase();

<template>
  <h1>Hello {{name}}</h1>
</template>
```

Then, we can call that function

```hbs
<h1>Hello {{(shout name)}}</h1>
```

We use wrapping `( )` to signify that that we are invoking a function with arguments.
The `( )` are needed to disambiguate between rendering values, `{{foo}}`, and invoking functions: `{{ (foo) }}`.
However, when there are arguments passed, there is no longer an ambiguity, and the `( )` are no longer needed.

So you could write the above call to the function, `shout`, like this:
```hbs
<h1>Hello {{shout name}}</h1>
```
