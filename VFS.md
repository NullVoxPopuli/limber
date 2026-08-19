# Project VFS: notes + plan

Goal: stop treating the URL as the document. Make an in-memory file system the source of truth,
and demote the URL to one of several ways to serialize it.

Scope note: this is the *project* file system (user-authored files). It is not
[#2011](https://github.com/NullVoxPopuli/limber/issues/2011) / [#1995](https://github.com/NullVoxPopuli/limber/pull/1995),
which is the *dependency* file system (npm tarballs unpacked into OPFS for the es-module-shims hooks).
They should share one interface. See "Two file systems" below.

## Why the URL code is weird today

Everything lives in `apps/repl/app/utils/editor-text.ts` (`FileURIComponent`). That one class is
currently the URL codec, the debouncer, the localStorage writer, the reactive text holder, and the
thing that drives the router.

Concrete symptoms, all in that file unless noted:

1. `#currentURL()` rebuilds an absolute URL from `router.currentURL`, with a testing-only branch that
   reads private router internals (`router.location.path`) and two `window.location` fallbacks.
2. Format is parsed by splitting a string on `?` and re-parsing search params, in three separate
   getters (`#text`, `format`, `flavor`).
3. `#qps` is a mutable `URLSearchParams` used as a message queue, and `rawText` is a fake query param
   that gets written, then deleted right before the real write.
4. `#pushUpdate` writes to localStorage as a side effect of a method whose job is updating the URL.
5. `routes/edit.ts` calls `transition.abort()` then `set()` + `flush()` to force a redirect. The
   comment in that file says the routing system "can't be trusted".
6. Debounce is made testable by hand, pushing/popping test-waiter tokens into a `#tokens` array.
7. `services/editor.ts` takes `setCodemirrorState` from a modifier, and documents the race where
   `updateDemo` can be called before the modifier has run.
8. `packages/limber-ui/src/code.gts` builds the iframe URL by string-concatenating query params, with
   a `&format=BUG:MISSING` sentinel when format is absent.
9. `#setURL` decides whether to no-op by comparing four hardcoded query params by name.
10. `#setURL` also rewrites the path: `if (base === '/' || base.startsWith('/docs')) base = '/edit/'`.

The shared cause: there is no object that represents "the thing being edited". Text, format, and
storage location are three loose values that every layer re-derives from a string.

## The model

```
File      { path, text }              // format is derived from the extension
Project   { files: Map<path, File>, entry: path }
Adapter   { load(): Project | null, save(project): void }
```

Adapters, in priority order at boot:

- `url` (existing `?c=` / `?t=` / `?format=`)
- `localStorage` (already half-implemented as `getStoredDocument`)
- `fetch` (the existing `?file=` branch in `routes/edit.ts`)
- `gist` (later, [#947](https://github.com/NullVoxPopuli/limber/issues/947))

What this buys, mapped back to the numbered list:

- Format stops being a query param and becomes `extname(entry)`. Kills 2, and most of 8.
- The URL is written from a project, not accumulated into a staging `URLSearchParams`. Kills 3 and 9.
- Persisting is an adapter call, not a side effect of routing. Kills 4.
- Boot reads adapters in order and hands the winner to the editor, so `beforeModel` no longer needs
  to abort a transition to correct the URL. Kills 5.
- One `save()` seam to debounce and to wrap in a single test waiter. Kills 6.

Items 1, 7, and 10 are router problems, not storage problems. They shrink, but do not disappear.

## Compatibility contract

Every URL in the wild has to keep working, and single-file projects have to keep serializing
byte-identically to today. That means:

- `?format=<fmt>&c=<lz-string>` stays the canonical single-file form.
- `?t=<uri-encoded>` stays readable, never written.
- `?format=glimdown` and `?format=gdm` keep aliasing to `gmd`.
- `?file=<url>`, `?editorLoad=`, `?forceEditor`, `?shadowdom=`, `?nohighlight=`, `?editor=` are
  untouched. They are view options, not document state.
- More than one file reuses `c`, as a `{ path: contents }` object, and omits `format`. Every URL
  in the wild has a format, so its absence is what distinguishes the two and a document that
  happens to be valid JSON is never read as a project.

`apps/repl/tests/application/-page/index.ts` already encodes most of this contract in
`expectRedirectToContent`. That page object is the regression net for the whole refactor.

## Two file systems

`packages/repl-sdk/src/index.js` dispatches `resolve`/`fetch` by URL prefix already: `manual:`,
`configured:`, `unzipped:`, `tgz:`. #1995 adds a `file://virtualFS/` prefix for downloaded npm
packages.

Project files can slot in as one more prefix against the same interface. If they do, then
`import Foo from './foo.gjs'` inside a multi-file project resolves through the same hooks that
resolve npm packages, and [#946](https://github.com/NullVoxPopuli/limber/issues/946) mostly falls
out of the work rather than needing its own machinery.

Minimum shared interface:

```
read(path): Promise<string | undefined>
write(path, contents): Promise<void>
list(prefix): Promise<string[]>
```

The dependency FS wants OPFS behind that interface. The project FS wants memory plus a serializer.
Same shape, different backing.

## Where it lives

`packages/repl-sdk`, exported from `repl-sdk/project`, `repl-sdk/project/url` and
`repl-sdk/project/local-storage`. One module per export, no barrel. The sdk owns the `Project`
concept and the app becomes a view over it. Multi-file imports then work through the existing resolve/fetch prefix
dispatch with no bridge, and the URL conventions (`c`, `t`, `format`) live in one place instead of
being re-implemented by `limber-ui`'s string concatenation.

The module has no dependency on Ember and no reactivity library. `Project` is immutable: mutations
return a new `Project`, so the Ember layer holds one `@tracked` reference and swaps it. No emitter,
no subscription, no effects.

## Staging

1. `Project` + `File` + a `url` adapter in repl-sdk, single-file only, no behavior change in the app.
   The existing application tests are the proof. Done.
2. `localStorage` adapter, and delete the storage side effect inside `#pushUpdate`. Done.
3. Boot from an ordered adapter list, and drop the `transition.abort()` dance in `routes/edit.ts`.
   Partly done, see below.
4. Multi-file serialization (#947). It exists and is tested; nothing writes more than one file yet.
   No length budget: the browser already errors on a URL that is too long, and guessing a limit
   here would only be wrong in both directions.
5. Wire the project FS into the sdk resolver so relative imports work (#946).

## What landed, and what it cost

New in `packages/repl-sdk/src/project/`, 55 node tests:

- `repl-sdk/project`: `Project` and `File`, immutable, no Ember, no reactivity library
- `repl-sdk/project/url`: `readProject`, `writeProject`
- `repl-sdk/project/local-storage`: `readStoredProject`, `writeStoredProject`, `storedFormat`

`apps/repl` changes: `FileURIComponent` became `ProjectState`, `routes/edit.ts` only computes a URL
and redirects, and the four call sites that reached through `editor.fileURIComponent` now go through
the service. The application suite is 54 passing, same as `origin/main`.

### Stage 3 is only half done

`transition.abort()` has to stay. Calling `router.replaceWith` from inside the `beforeModel` of the
transition it replaces crashes the router in `finalizeQueryParamChange`, because `/edit` declares no
query params and `_queryParamsFor` reads `.name` off an undefined handler. The abort plus a
microtask is what makes the redirect land. So item 5 in the weirdness list shrank (the route no
longer writes editor state behind the transition's back) but did not disappear.

### Three bugs surfaced on the way

The localStorage restore never worked. `setStoredDocument` wrote `active-format = "gjs-doc"` and
`getStoredDocument` appended `-doc` again, so it looked up `gjs-doc-doc` and always missed. The
adapter reads the correct key, which means "reopen what I had last" starts working for anyone with
one of those entries. Two consequences: visiting `/edit` fresh now restores the last document
instead of showing the default snippet, and application tests had to start clearing localStorage,
because the first test to save a document was deciding what every later test booted with.

`?file=` refetched forever. Following it used to leave `file` in the URL, so every reload refetched
and discarded anything typed since. The URL now drops `file` once the fetch has happened.

Typing raced the document swap. CodeMirror reports the swapped-in text back through `handleUpdate`,
which arrives before the swap commits. Queueing on top of committed state instead of staged state
threw the new format away, so switching demos landed on the old format. `queue` and `forceFormat`
build on `#staged`.

## Still weird

- `format-buttons.gts` swaps the document but never tells CodeMirror, so the editor shows the old
  text under the new format. Left alone here to keep the diff behavior-neutral.
- `app/utils/messaging.ts` still has `fileFromParams`, a second implementation of URL parsing. Only
  a test uses it now.
- `limber-ui`'s `INITIAL_URL` still concatenates query params by hand, `&format=BUG:MISSING` and all.
  It can call `urlAdapter.serialize` instead.
- `ProjectState.format` still falls back to reading `?format` directly, because a URL can name a
  format without carrying a document.

### Format vs extension

Deriving format from the file extension is a trap for stage 1. `languages.gts` maps `svelte` to the
extension `sevlte`, `mermaid` to `yaml`, and `hbs|ember` to `hbs`, so the round trip is already
lossy. So `File` carries an optional explicit `format`, and falls back to extension only when it is
absent. Real filenames arrive with multi-file work in stage 4, and extension derivation becomes
correct then.
