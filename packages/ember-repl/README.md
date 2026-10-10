# ember-repl

[![npm version](https://badge.fury.io/js/ember-repl.svg)](https://badge.fury.io/js/ember-repl)
[![CI](https://github.com/NullVoxPopuli/ember-repl/actions/workflows/ci.yml/badge.svg?branch=main&event=push)](https://github.com/NullVoxPopuli/ember-repl/actions/workflows/ci.yml)

## Documentation

Docs are here: https://limber.glimdown.com/docs/ember-repl

## Markdown at build time

`ember-repl/vite` compiles markdown files to components when the app builds.
Each live code fence in a file is a component in the same module, so nothing compiles in the browser for these files.
Tools that pre-render pages (SSG) get the whole page.

```js
import { ember, extensions } from '@embroider/vite';
import { babel } from '@rollup/plugin-babel';
import { emberRepl } from 'ember-repl/vite';

export default defineConfig({
  plugins: [
    emberRepl({
      // optional: what the prose and the hbs demos can use
      imports: `import { Callout } from '#components/callout.gjs';`,
    }),
    ember(),
    babel({ babelHelpers: 'runtime', extensions }),
  ],
});
```

Then import a file like any other component:

```js
import Guide from './guide.gjs.md';
```

By default, the plugin takes files that end in `.gjs.md`. Change that with `include` (a `RegExp`).
`remarkPlugins` and `rehypePlugins` work the same as at runtime.

## Security

Many developers know that evaluating runnable user input is a huge security risk.
To mitigate risk, this library should not be used in an environment that has access to
sensitive data. Additionally, end-users of this library (users of the consuming app) should
be made aware of the risk so that they themselves do not paste foreign / unrecognized /
untrusted code into the REPL.

This library itself will stay as up to date as possible, and if there are any security concerns,
please email security [at] nullvoxpopuli.com

## Contributing

See the [Contributing](CONTRIBUTING.md) guide for details.


## License

This project is licensed under the [MIT License](LICENSE.md).
