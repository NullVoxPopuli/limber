---
'ember-repl': minor
---

Additional exports:

- `compile`
- `Compiled`

These enable editors to more easily integrate with the multiple formats supported by ember-repl.

`compile` is an imperative interface where you can provide callbacks for what you'd like to do on success, error, and start of a compilation.

`Compiled` is a resource for when you don't want to do any of the above, and want just get to rendering. This utility resource is a only a few lines and immediately wraps `compile` while providing 3 reactive values to use directly in your templates.

See the README for more information.
