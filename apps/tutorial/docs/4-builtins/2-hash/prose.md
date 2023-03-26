`hash` is similar in purpose to an `array`, except that it creates objects instead of arrays.

```hbs
{{#let (hash one=1 two=2) as |data|}}
  {{data}}
{{/let}}
```

[Documentation][docs]

[docs]: https://api.emberjs.com/ember/release/classes/Ember.Templates.helpers/methods/hash?anchor=hash 
