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

## Debugging

Only one `Compiler` runs per window. Its `fs` getter shows everything a demo ran against:

```js
compiler.fs.list()                            // every URL in the module fs
compiler.fs.list('file:///npm/nanoid@6.0.1/') // one package
compiler.fs.read(url).source
```

Where to find `compiler` in the devtools console:

- `ember-repl` stores its service at `REPL.compiler`, so the SDK instance is `REPL.compiler.compiler`.
- Otherwise, use the instance your app created.

The SDK's own caches live at `globalThis[Symbol.for('__repl-sdk__compiler__')]`:
`resolves` (module path to module value), `tarballs`, and `promiseCache`.

### Stored packages

Downloaded packages are kept in the browser's origin private file system, so
a reload does not download them again. Exact versions never expire. A tag such
as `latest` or a range is looked up again after five minutes, the same limit
the registry uses.

```js
await Compiler.clearStoredPackages();
```
