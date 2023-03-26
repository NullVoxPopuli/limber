You can always make an array in JavaScript-space

```js
let myArray = [];
```

But if you want the individual elements of an array to be individually reactive, you can make an array via the `(array)` helper in template-space

```hbs
{{#let (array one two) as |data|}}
  {{data}}
{{/let}}
```

When creating arrays this way, value `two` can change and not affect the reactivity of value `one`.

[Documentation][docs]

[docs]: https://api.emberjs.com/ember/release/classes/Ember.Templates.helpers/methods/array?anchor=array
