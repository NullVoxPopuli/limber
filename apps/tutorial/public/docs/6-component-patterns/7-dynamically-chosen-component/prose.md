Sometimes, it may be desired to render different components based on a variety of criteria. Sometimes this criteria is based on user input, sometimes it is based on arguments to the component.

In any case, the way we select which component to render is the same as we select any value to render.

First, we need to start with existing components to dynamically choose.
These could be imported:
```js
import { Three } from './number-components';
import { Bee } from './flying-components';
import { Tree } from './plant-components';
```

But for the purposes of this exercise, let's define them all inline:
```gjs
const Three = <template>3 | Three</template>;
const Bee   = <template>🐝 | Bee</template>;
const Tree  = <template>🌲 | Tree</template>;
```

So in order to dynamically select between these components, we need some logic -- let's start with a small form to help select which component to render.

```hbs
<fieldset>
  <legend>Choose a component</legend>
  <label>Three <input name="component" type="radio" value="three"></label>
  <label>Bee   <input name="component" type="radio" value="bee"></label>
  <label>Tree  <input name="component" type="radio" value="tree"></label>
</fieldset>
```

This boilerplate, provided for you, will allow us to choose an option (based on the `value` attribute's value) from the Form and give us an opportunity to interpret that FormData into a component to render. 

As you can see from the implemented form-handling functions, the value of the `component` field is stored on `this.selected`. We can use `this.selected`, which will be a string, to map to one of our defined components.

```js
get Selected() {
  return MAP[this.selected] ?? Fallback;
}
```

Note that this property could be named anything, and the casing is not important. We render the `Selected` getter like so:

```hbs 
<this.Selected />
```
Like regular component invocation we can pass arguments, add modifiers, pass block-content, etc.

Next let's define `Fallback` as we won't initially have a value, but we do want to render _something_: 
```gjs
const Fallback = <template>Choose an option</template>;
```

And lastly, to hook up the data for the `Selected` getter, we need to define the value to component map, `MAP`:
```js 
const MAP = {
  three: Three,
  bee: Bee,
  tree: Tree,
};
```

<details><summary>Alternate Solution</summary>

In the above, we use a getter to define the component, but it's possible to do this outside of the class as well.

We'd need to define a function in module space to take the place of the getter that we'll then need to invoke, like this:

```hbs
{{#let (componentFor this.selected) as |Selected|}}
  <Selected />
{{/let}}
```

This `componentFor` function will do the exact same mapping. 

```js
const componentFor = (key) => MAP[key] ?? Fallback;
```

</details>

<details><summary>Without a fallback</summary>

In order to not use a `Fallback` component for either the getter solution or the `#let`-using solution, you'd have to use an `#if` block, like this:

```gjs
class Demo extends Component {  
  /** ... **/
  get Selected() {
    return MAP[this.selected];
  }

  <template>
    {{! ... }}

    {{#if this.Selected}}
      <this.Selected />
    {{/if}}
  </template>
}
```

or

```gjs
<template>
  {{! ... }}

  {{#if this.selected}}
    {{#let (componentFor this.selected) as |Selected|}}
      <Selected />
    {{/let}}
  {{/if}}
</template>
```

</details>
