`helper` is used for [partial application][wiki] of arguments to helpers.

_Most_ helpers in Glimmer/Ember _are_ functions, so `fn` would be sufficient,
but helpers can be things other than functions ([class-based][docs-class-helper] helpers, resources, etc), thanks to [Helper Managers][rfc-625].

```hbs
{{#let (helper stringify data) as |preWired|}}
```

Try partially applying arguments to the given helper.

[Documentation][docs]

[docs]: https://api.emberjs.com/ember/release/classes/Ember.Templates.helpers/methods/helper?anchor=helper
[wiki]: https://en.wikipedia.org/wiki/Partial_application
[rfc-625]: https://rfcs.emberjs.com/id/0625-helper-managers/
[docs-class-helper]: https://api.emberjs.com/ember/release/classes/Helper
