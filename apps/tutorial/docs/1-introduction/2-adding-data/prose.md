A component that renders some static markup isn't very interesting.
Let's add some data.

First, define a local variable

```gjs
let name = "world";

<template>
  <h1>Hello World</h1>
</template>
```

Then, we can refer to `name` in the markup:

```hbs
<h1>Hello {{name}}</h1>
```

Inside the curly braces, we can put any _reference_ we want.
