# REPL SDK

A Runtime compiler for anything that you could want to build a lighting fast REPL with.


Features:
- Uses [es-module-shims](https://github.com/guybedford/es-module-shims)
- Built in support for JavaScript, Mermaid, React, Vue, Svelte, Ember, Markdown
  - On-Demand Runtime: only pay for what you compile for - the async APIs mean that your users only load what they need.
- Supports nested languages (for markdown) 
- Add any additional compiler/renderer at any time -- the flexible API allows for new libraries/frameworks to be added easily

## Usage 


### Heading ids

Every markdown heading gets an `id`, so in-page anchors can link to sections.

Ids match what GitHub generates for the same markdown, via
[`github-slugger`][github-slugger]:

```
### `setupMirage`   ->  #setupmirage
### V2 JSON:API     ->  #v2-jsonapi
```

A `.md` file is typically read in two places — a rendered site, and the repo on
GitHub — and an in-page `#anchor` only resolves in both if the two agree on how
the id is derived.

Like GitHub, repeated headings within a document are de-duplicated (`#usage`,
`#usage-1`, `#usage-2`), and the numbering restarts for each document.
Whitespace the author wrote is preserved rather than collapsed, also matching
GitHub: `##   Hello    World` becomes `#hello----world`.

A heading with an explicit `{#custom-id}` suffix keeps that id instead.

> [!NOTE]
> Heading anchors are not part of the [GFM spec][gfm-spec], which covers
> autolink literals, footnotes, strikethrough, tables and tasklists. GitHub
> generates them in its rendering layer — `github-slugger` is that behavior,
> extracted.

[github-slugger]: https://github.com/Flet/github-slugger
[gfm-spec]: https://github.github.com/gfm/

## Installed packages

Packages a demo imports are downloaded from npm once and unpacked into the browser's origin
private file system, so a reload does not download them again. Only the unpacked files are
kept. Browsers without that storage, and Node, work the same but download every time.

## Plugins

Plugins change how modules resolve, load, and transform. The hooks have the shape of Rollup's:

```js
new Compiler({
  plugins: [
    {
      name: 'my-cdn',
      async resolveId(source, importer, { versions }) {
        if (source === 'lodash') return 'https://esm.sh/lodash-es@4';
      },
      transform(code, id) {
        if (id.endsWith('.js')) return code.replaceAll('import.meta.env.DEV', 'true');
      },
    },
  ],
});
```

- `buildStart(ctx)` runs before each compile.
- `resolveId(source, importer, ctx)` returns an id, or nothing to pass to the next plugin.
- `load(id, ctx)` returns the text of a module, or nothing.
- `transform(code, id, ctx)` returns new text, or nothing.

An id is a URL in the module fs. An http(s) id downloads into the fs under `file:///external/<host>/`.

`resolveId` can be async. A synchronous answer costs nothing extra. An async answer costs one small module for each importer, which re-exports the answer, so the module itself still loads one time. In that re-export, `default` is not a live binding.

A compiler config can have `plugins` too. Its `resolve` and its compiler's `handlers` become plugins.

## Provided modules and pins

`resolve` gives modules that the host already has. `versions` pins packages, and a compile can pass its own. A pin loads the package from npm in place of the provided modules. `packages` tells which provided modules belong to which package:

```js
new Compiler({
  resolve: {
    '@ember/owner': () => import('@ember/owner'),
    'ember-primitives': () => import('ember-primitives'),
  },
  packages: {
    'ember-source': { version: '7.3.0', modules: ['@ember/owner'] },
    'ember-primitives': { builtWith: ['ember-source'] },
  },
});
```

- A module that is in no `modules` list belongs to the package that its name starts with.
- A pin that accepts `version` keeps the provided modules.
- A pin of a package in `builtWith` loads this package from npm too, so that both match.

Addons that load from npm use `@embroider/macros` without a build. When such a module loads, the Ember compilers answer its macros:

- `dependencySatisfies`, `appEmberSatisfies` and `moduleExists` become `true` or `false`, from the versions that the module gets in this compile.
- `importSync('x')` becomes an import of `x`, so the pins apply to it too.
- `macroCondition` runs in the browser, so the branches that a build would remove stay.

Plugins see the same versions through `ctx.versionOf(name, importer)`.

## Debugging

Only one `Compiler` runs per window. Its `fs` getter shows everything a demo ran against:

```js
await compiler.fs.list('/node_modules')                     // every installed file
await compiler.fs.list('/node_modules/.deps/nanoid@5.1.5') // one package
await compiler.fs.read('/node_modules/nanoid/index.browser.js')
```

Where to find `compiler` in the devtools console:

- `ember-repl` stores its service at `REPL.compiler`, so the SDK instance is `REPL.compiler.compiler`.
- Otherwise, use the instance your app created.

The SDK's own caches live at `globalThis[Symbol.for('__repl-sdk__compiler__')]`:
`resolves` (the values of provided modules, by module name) and `promiseCache`.
