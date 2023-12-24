`fn` is used for [partial application][wiki] of arguments to functions.

This is used for pre-wiring arguments to functions so that they may be passed elsewhere without that consumer needing to pass any arguments themselves.

```hbs
{{#let (fn stringify data) as |preWired|}}
```

Given that `stringify` is a function, `fn` partially applies `data` as the new first argument.
So invoking `preWired()` would be equivalent to `stringify(data)`.
Likewise, invoking `preWired('more data')` would be equivalent to `stringify(data, 'more-data')`.

[Documentation][docs]

[docs]: https://api.emberjs.com/ember/4.11/classes/Ember.Templates.helpers/methods/fn?anchor=fn
[wiki]: https://en.wikipedia.org/wiki/Partial_application
