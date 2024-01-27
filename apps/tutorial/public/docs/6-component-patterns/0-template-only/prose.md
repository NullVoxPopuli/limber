Template-only components have many names, but are all the same thing. 
- presentation(al) components
- display components
- dumb components (vs "smart" which would have state)

Specifically, a template-only component has no state of its own, like a class-component would.
This comes with [some advantages](https://nullvoxpopuli.com/2023-12-20-template-only-vs-class-components) (less complexity, less to do, etc).

To define a template-only component, you only need to use the `<template>` tags anywhere,
For example:
```gjs
const TemplateOnly = <template>
    display / presentational 
    content here
</template>;
```

These can be used the same as components with state.

```gjs
<template>
    <TemplateOnly />
</template>
```

In order to use a template-only component is this tutorial, we have to invoke it within another template-only component!
