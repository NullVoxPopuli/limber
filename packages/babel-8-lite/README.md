# @glimdown/babel-8-lite

Babel 8 for the browser, with only what the compilers of `repl-sdk` use.

This package is private and not published. `ember-repl` bundles it as its own chunk,
and gives it to `repl-sdk` under the name `@glimdown/babel-8-lite`.

It has the same shape as `@babel/standalone`:

- `transform` (synchronous), `transformSync`, `transformAsync`, `parse`, `version`
- `availablePlugins['transform-typescript']`
- `availablePresets.react`

`@babel/standalone` is about twice the size, because it has every plugin and preset.

A host of `repl-sdk` that does not provide `@glimdown/babel-8-lite` gets `@babel/standalone` from a CDN.

To add a plugin or preset, add it to `src/index.js` and to `index.d.ts`.
