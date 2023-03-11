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
