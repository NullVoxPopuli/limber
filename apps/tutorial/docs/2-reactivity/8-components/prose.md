Components are the collection of the primitives that build higher level UI.

Defining a component is done with `<template>` tags.

In every `gjs` or `gts` file, 
```gjs
<template>
  content here
</template>
```

is a syntactical sugar for `export default`, which is also allowed to be written, but is slightly more verbose:
```gjs 
export default <template>
  content here
</template>;
```

Multiple components can be defined in one file and assigned to a variable:
```gjs
const NameInput = <template>
  ...
</template>;
```

Components are invoked with `<` and `>` and arguments are passed via `@`-prefixed names.

```hbs
<Greeting @name="Yoda" />
```

_Invoke the ready-made component(s) and pass an argument._

