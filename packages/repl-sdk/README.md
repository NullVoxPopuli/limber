# REPL SDK

A Runtime compiler for anything that you could want to build a lighting fast REPL with.


Features:
- Uses [es-module-shims](https://github.com/guybedford/es-module-shims)
- Built in support for JavaScript, Mermaid, React, Vue, Svelte, Ember, Markdown
  - On-Demand Runtime: only pay for what you compile for - the async APIs mean that your users only load what they need.
- Supports nested languages (for markdown) 
- Add any additional compiler/renderer at any time -- the flexible API allows for new libraries/frameworks to be added easily

## Usage 


### Markdown options

#### `headingId`

Every heading gets an `id`, so anchors can link to sections. `headingId.slug`
controls how the heading's text becomes that id.

| `slug` | `### setupMirage` | `### V2 JSON:API` |
| --- | --- | --- |
| `'kebab'` (default) | `#setup-mirage` | `#v2-json-api` |
| `'gfm'` | `#setupmirage` | `#v2-jsonapi` |

Set it for the compiler, or per compile:

```js
const compiler = new Compiler({
  options: {
    md: { headingId: { slug: 'gfm' } },
  },
});

// or, overriding for one document
await compiler.compile('md', text, { headingId: { slug: 'gfm' } });
```

Use `'gfm'` when the same `.md` file is read both in a rendered site and on
GitHub — an in-page `#anchor` can only resolve in both if the two agree on how
ids are generated, and GitHub's rule is [`github-slugger`][github-slugger].

Like GitHub, `'gfm'` also de-duplicates repeated headings within a document
(`#usage`, `#usage-1`, `#usage-2`). The counter restarts for each document.

A function is accepted for anything neither mode covers. It receives the
heading's text with whitespace already collapsed:

```js
{ headingId: { slug: (text) => text.toUpperCase() } }
```

A heading with an explicit `{#custom-id}` suffix is left alone in every mode.

> [!NOTE]
> Heading anchors are not part of the [GFM spec][gfm-spec], which covers
> autolink literals, footnotes, strikethrough, tables and tasklists. GitHub
> generates them in its rendering layer. `'gfm'` is named for the behavior
> people expect from GitHub-flavored markdown, not for a spec requirement.

[github-slugger]: https://github.com/Flet/github-slugger
[gfm-spec]: https://github.github.com/gfm/
