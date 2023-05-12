---
'ember-repl': major
---

Now compatible with Glint types.

This is considered a breaking change because the types became _stricter_.

Previously the `component` property was `unknown`, and now it is `ComponentLike` (from `@glint/template`)
