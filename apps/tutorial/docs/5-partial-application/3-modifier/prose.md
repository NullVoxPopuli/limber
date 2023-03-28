`modifier` is used for [partial application][wiki] of arguments to modifiers.

This can be useful for pre-wiring arguments to complex modifiers, or modifiers with private implementation details that a consumer may not need to care about.

```hbs 
{{#let (modifier on 'click' handler) as |preWired|}}
```

Try partially applying arguments to the given modifier as use that pre-wired modifier on the button.

[Documentation][docs]

[docs]: https://api.emberjs.com/ember/modifier/classes/Ember.Templates.helpers/methods/modifier?anchor=modifier
[wiki]: https://en.wikipedia.org/wiki/Partial_application
