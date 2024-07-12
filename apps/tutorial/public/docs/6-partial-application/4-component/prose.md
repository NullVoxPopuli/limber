`component` is used for [partial application][wiki] of arguments to conponents.

This can be useful for pre-wiring arguments to complex components, or components with private implementation details that a consumer may not need to care about.

```hbs
{{#let (component Greeting response="General Kenobi!") as |preWired|}}
```

Try partially applying arguments to the given component.

[Documentation][docs]

[docs]: https://api.emberjs.com/ember/release/classes/Ember.Templates.helpers/methods/component?anchor=component
[wiki]: https://en.wikipedia.org/wiki/Partial_application
