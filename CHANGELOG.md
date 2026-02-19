# Changelog

## Release (2026-02-17)

* ember-repl 8.0.0 (major)
* limber-ui 4.2.0 (minor)
* repl-sdk 1.5.0 (minor)

#### :boom: Breaking Change
* `ember-repl`
  * [#2067](https://github.com/NullVoxPopuli/limber/pull/2067) Remove @embroider/addon-shim from ember-repl (ember-repl is now vite-only) ([@Copilot](https://github.com/apps/copilot-swe-agent))

#### :rocket: Enhancement
* `ember-repl`, `limber-ui`, `repl-sdk`
  * [#2073](https://github.com/NullVoxPopuli/limber/pull/2073) Revert renderApp workaround (back to renderComponent) -- now requires at least ember-source 6.12.0-alpha.4 ([@Copilot](https://github.com/apps/copilot-swe-agent))

#### :bug: Bug Fix
* `ember-repl`, `repl-sdk`
  * [#2083](https://github.com/NullVoxPopuli/limber/pull/2083) Resolve ember-template-compiler deprecation ([@NullVoxPopuli](https://github.com/NullVoxPopuli))

#### :house: Internal
* [#2075](https://github.com/NullVoxPopuli/limber/pull/2075) ✨ Set up Copilot instructions ([@Copilot](https://github.com/apps/copilot-swe-agent))

#### Committers: 2
- Copilot [Bot] ([@copilot-swe-agent](https://github.com/apps/copilot-swe-agent))
- [@NullVoxPopuli](https://github.com/NullVoxPopuli)

## Release (2026-02-12)

* ember-repl 7.3.5 (patch)
* repl-sdk 1.4.1 (patch)

#### :bug: Bug Fix
* `repl-sdk`
  * [#2071](https://github.com/NullVoxPopuli/limber/pull/2071) Fix closing components elements used in markdown ([@NullVoxPopuli](https://github.com/NullVoxPopuli))

#### Committers: 1
- [@NullVoxPopuli](https://github.com/NullVoxPopuli)

## Release (2026-02-02)

* ember-repl 7.3.4 (patch)
* repl-sdk 1.4.0 (minor)

#### :rocket: Enhancement
* `repl-sdk`
  * [#2065](https://github.com/NullVoxPopuli/limber/pull/2065) Expose buildCompiler ([@NullVoxPopuli](https://github.com/NullVoxPopuli))

#### Committers: 1
- [@NullVoxPopuli](https://github.com/NullVoxPopuli)

## Release (2026-02-02)

* ember-repl 7.3.3 (patch)
* repl-sdk 1.3.0 (minor)

#### :rocket: Enhancement
* `repl-sdk`
  * [#2060](https://github.com/NullVoxPopuli/limber/pull/2060) expose the markdown compiler ([@NullVoxPopuli](https://github.com/NullVoxPopuli))

#### Committers: 1
- [@NullVoxPopuli](https://github.com/NullVoxPopuli)

## Release (2026-02-01)

* ember-repl 7.3.2 (patch)
* limber-ui 4.1.1 (patch)
* repl-sdk 1.2.0 (minor)
* codemirror-lang-glimdown 2.0.3 (patch)
* @glimdown/lezer 2.0.3 (patch)
* codemirror-lang-glimmer-js 2.0.3 (patch)
* @glimdown/lezer-glimmer-expression 2.0.3 (patch)
* codemirror-lang-glimmer-ts 2.0.3 (patch)
* codemirror-lang-glimmer 2.0.3 (patch)
* lezer-glimmer 2.0.3 (patch)

#### :rocket: Enhancement
* `repl-sdk`
  * [#2058](https://github.com/NullVoxPopuli/limber/pull/2058) Support component invocation in gmd ([@NullVoxPopuli](https://github.com/NullVoxPopuli))

#### :bug: Bug Fix
* `repl-sdk`, `codemirror-lang-glimdown`, `@glimdown/lezer`, `codemirror-lang-glimmer-js`, `@glimdown/lezer-glimmer-expression`, `codemirror-lang-glimmer-ts`, `codemirror-lang-glimmer`, `lezer-glimmer`
  * [#2057](https://github.com/NullVoxPopuli/limber/pull/2057) Widen deps ([@NullVoxPopuli](https://github.com/NullVoxPopuli))

#### :house: Internal
* `ember-repl`, `limber-ui`
  * [#2054](https://github.com/NullVoxPopuli/limber/pull/2054) Update glint ([@NullVoxPopuli](https://github.com/NullVoxPopuli))

#### Committers: 1
- [@NullVoxPopuli](https://github.com/NullVoxPopuli)

## Release (2026-01-16)

* ember-repl 7.3.1 (patch)

#### :bug: Bug Fix
* `ember-repl`
  * [#2051](https://github.com/NullVoxPopuli/limber/pull/2051) Add more exports for decorator-transforms ([@NullVoxPopuli](https://github.com/NullVoxPopuli))

#### :memo: Documentation
* [#2049](https://github.com/NullVoxPopuli/limber/pull/2049) docs(contributor): contributors readme action update ([@github-actions[bot]](https://github.com/apps/github-actions))
* [#2046](https://github.com/NullVoxPopuli/limber/pull/2046) fix: dom event correctly references first example ([@billybonks](https://github.com/billybonks))

#### Committers: 3
- GitHub Actions [Bot] ([@github-actions](https://github.com/apps/github-actions))
- Sebastien Stettler ([@billybonks](https://github.com/billybonks))
- [@NullVoxPopuli](https://github.com/NullVoxPopuli)

## Release (2026-01-11)

* ember-repl 7.3.0 (minor)
* limber-ui 4.1.0 (minor)
* repl-sdk 1.1.2 (patch)
* codemirror-lang-glimdown 2.0.2 (patch)
* @glimdown/lezer 2.0.2 (patch)
* codemirror-lang-glimmer-js 2.0.2 (patch)
* @glimdown/lezer-glimmer-expression 2.0.2 (patch)
* codemirror-lang-glimmer-ts 2.0.2 (patch)
* codemirror-lang-glimmer 2.0.2 (patch)
* lezer-glimmer 2.0.2 (patch)

#### :rocket: Enhancement
* `ember-repl`, `limber-ui`
  * [#2045](https://github.com/NullVoxPopuli/limber/pull/2045) Upgrade decorator-transforms, Update kolay ([@NullVoxPopuli](https://github.com/NullVoxPopuli))

#### :bug: Bug Fix
* `limber-ui`
  * [#2041](https://github.com/NullVoxPopuli/limber/pull/2041) Fix `<REPL>` component's boolean handling, for embedding, and complete 4 more tutorial chapters ([@NullVoxPopuli](https://github.com/NullVoxPopuli))
* `ember-repl`, `codemirror-lang-glimdown`, `@glimdown/lezer`, `codemirror-lang-glimmer-js`, `@glimdown/lezer-glimmer-expression`, `codemirror-lang-glimmer-ts`, `codemirror-lang-glimmer`, `lezer-glimmer`
  * [#2039](https://github.com/NullVoxPopuli/limber/pull/2039) Remove outdated changelogs -- all changes are tracked in one changelog at the monorepo root ([@NullVoxPopuli](https://github.com/NullVoxPopuli))

#### :memo: Documentation
* `limber-ui`
  * [#2041](https://github.com/NullVoxPopuli/limber/pull/2041) Fix `<REPL>` component's boolean handling, for embedding, and complete 4 more tutorial chapters ([@NullVoxPopuli](https://github.com/NullVoxPopuli))

#### :house: Internal
* `ember-repl`, `limber-ui`
  * [#2045](https://github.com/NullVoxPopuli/limber/pull/2045) Upgrade decorator-transforms, Update kolay ([@NullVoxPopuli](https://github.com/NullVoxPopuli))
* `ember-repl`, `repl-sdk`, `codemirror-lang-glimdown`, `codemirror-lang-glimmer-js`, `codemirror-lang-glimmer-ts`, `codemirror-lang-glimmer`
  * [#2044](https://github.com/NullVoxPopuli/limber/pull/2044) Update vite deps ([@NullVoxPopuli](https://github.com/NullVoxPopuli))
* `ember-repl`, `limber-ui`, `repl-sdk`, `codemirror-lang-glimdown`, `@glimdown/lezer`, `codemirror-lang-glimmer-js`, `@glimdown/lezer-glimmer-expression`, `codemirror-lang-glimmer-ts`, `codemirror-lang-glimmer`, `lezer-glimmer`
  * [#2043](https://github.com/NullVoxPopuli/limber/pull/2043) Update some deps ([@NullVoxPopuli](https://github.com/NullVoxPopuli))
* `ember-repl`, `limber-ui`, `repl-sdk`
  * [#2042](https://github.com/NullVoxPopuli/limber/pull/2042) Update some deps ([@NullVoxPopuli](https://github.com/NullVoxPopuli))

#### Committers: 1
- [@NullVoxPopuli](https://github.com/NullVoxPopuli)

## Release (2026-01-05)

* ember-repl 7.2.3 (patch)

#### :bug: Bug Fix
* `ember-repl`
  * [#2037](https://github.com/NullVoxPopuli/limber/pull/2037) Glimmer validator is private ([@NullVoxPopuli](https://github.com/NullVoxPopuli))

#### Committers: 1
- [@NullVoxPopuli](https://github.com/NullVoxPopuli)

## Release (2026-01-03)

* ember-repl 7.2.2 (patch)
* repl-sdk 1.1.1 (patch)

#### :rocket: Enhancement
* [#2029](https://github.com/NullVoxPopuli/limber/pull/2029) Forbid immediate code execution in specific circumstances ([@NullVoxPopuli](https://github.com/NullVoxPopuli))

#### :bug: Bug Fix
* `repl-sdk`
  * [#2033](https://github.com/NullVoxPopuli/limber/pull/2033) Revert usage of renderComponent due to https://github.com/emberjs/ember.js/issues/21023 ([@NullVoxPopuli](https://github.com/NullVoxPopuli))

#### Committers: 1
- [@NullVoxPopuli](https://github.com/NullVoxPopuli)

## Release (2025-12-29)

* ember-repl 7.2.1 (patch)

#### :bug: Bug Fix
* `ember-repl`
  * [#2026](https://github.com/NullVoxPopuli/limber/pull/2026) Add appEmberSatisfies to runtime @embroider/macros implementation ([@NullVoxPopuli](https://github.com/NullVoxPopuli))

#### Committers: 1
- [@NullVoxPopuli](https://github.com/NullVoxPopuli)

## Release (2025-12-26)

* ember-repl 7.2.0 (minor)
* repl-sdk 1.1.0 (minor)

#### :rocket: Enhancement
* `ember-repl`, `repl-sdk`
  * [#1977](https://github.com/NullVoxPopuli/limber/pull/1977) Will `renderComponent` work for everything? ([@NullVoxPopuli](https://github.com/NullVoxPopuli))

#### Committers: 1
- [@NullVoxPopuli](https://github.com/NullVoxPopuli)

## Release (2025-12-22)

* ember-repl 7.1.3 (patch)
* repl-sdk 1.0.3 (patch)

#### :bug: Bug Fix
* `repl-sdk`
  * [#2021](https://github.com/NullVoxPopuli/limber/pull/2021) repl-sdk: move more deps to depndencies ([@NullVoxPopuli](https://github.com/NullVoxPopuli))

#### Committers: 1
- [@NullVoxPopuli](https://github.com/NullVoxPopuli)

## Release (2025-12-22)

* ember-repl 7.1.2 (patch)
* repl-sdk 1.0.2 (patch)

#### :bug: Bug Fix
* `repl-sdk`
  * [#2019](https://github.com/NullVoxPopuli/limber/pull/2019) Clean repl-sdk pacakge.json ([@NullVoxPopuli](https://github.com/NullVoxPopuli))

#### Committers: 1
- [@NullVoxPopuli](https://github.com/NullVoxPopuli)

## Release (2025-12-22)

* ember-repl 7.1.1 (patch)

#### :bug: Bug Fix
* `ember-repl`
  * [#2017](https://github.com/NullVoxPopuli/limber/pull/2017) Markdown deps are bundled, don't define imports for them in ember-repl ([@NullVoxPopuli](https://github.com/NullVoxPopuli))

#### Committers: 1
- [@NullVoxPopuli](https://github.com/NullVoxPopuli)

## Release (2025-12-22)

* ember-repl 7.1.0 (minor)

#### :rocket: Enhancement
* `ember-repl`
  * [#2015](https://github.com/NullVoxPopuli/limber/pull/2015) Update content-tag to v4, and bundlne some babel behavior ([@NullVoxPopuli](https://github.com/NullVoxPopuli))

#### :memo: Documentation
* [#2016](https://github.com/NullVoxPopuli/limber/pull/2016) Related projects ([@NullVoxPopuli](https://github.com/NullVoxPopuli))
* [#2010](https://github.com/NullVoxPopuli/limber/pull/2010) Tabify the docs ([@NullVoxPopuli](https://github.com/NullVoxPopuli))
* [#2008](https://github.com/NullVoxPopuli/limber/pull/2008) Update ember-repl instructions to use babel#17653 ([@NullVoxPopuli](https://github.com/NullVoxPopuli))

#### Committers: 1
- [@NullVoxPopuli](https://github.com/NullVoxPopuli)

## Release (2025-12-20)

* ember-repl 7.0.2 (patch)
* limber-ui 4.0.2 (patch)
* repl-sdk 1.0.1 (patch)
* codemirror-lang-glimdown 2.0.1 (patch)
* @glimdown/lezer 2.0.1 (patch)
* codemirror-lang-glimmer-js 2.0.1 (patch)
* @glimdown/lezer-glimmer-expression 2.0.1 (patch)
* codemirror-lang-glimmer-ts 2.0.1 (patch)
* codemirror-lang-glimmer 2.0.1 (patch)
* lezer-glimmer 2.0.1 (patch)

#### :memo: Documentation
* `limber-ui`
  * [#1991](https://github.com/NullVoxPopuli/limber/pull/1991) Add docs link for limber-ui ([@NullVoxPopuli](https://github.com/NullVoxPopuli))
* Other
  * [#1988](https://github.com/NullVoxPopuli/limber/pull/1988) More REPL-sdk docs ([@NullVoxPopuli](https://github.com/NullVoxPopuli))

#### :house: Internal
* Other
  * [#2007](https://github.com/NullVoxPopuli/limber/pull/2007) More filtering ([@NullVoxPopuli](https://github.com/NullVoxPopuli))
  * [#2006](https://github.com/NullVoxPopuli/limber/pull/2006) More maybeBabel filtering ([@NullVoxPopuli](https://github.com/NullVoxPopuli))
* `repl-sdk`
  * [#1968](https://github.com/NullVoxPopuli/limber/pull/1968) Optimize REPL load - Rolldown, etc ([@NullVoxPopuli](https://github.com/NullVoxPopuli))
* `ember-repl`, `limber-ui`, `repl-sdk`, `codemirror-lang-glimdown`, `@glimdown/lezer`, `codemirror-lang-glimmer-js`, `@glimdown/lezer-glimmer-expression`, `codemirror-lang-glimmer-ts`, `codemirror-lang-glimmer`, `lezer-glimmer`
  * [#2001](https://github.com/NullVoxPopuli/limber/pull/2001) Update all the things ([@NullVoxPopuli](https://github.com/NullVoxPopuli))

#### Committers: 1
- [@NullVoxPopuli](https://github.com/NullVoxPopuli)

## Release (2025-10-16)

* ember-repl 7.0.1 (patch)
* limber-ui 4.0.1 (patch)

#### :bug: Bug Fix
* `ember-repl`, `limber-ui`
  * [#1986](https://github.com/NullVoxPopuli/limber/pull/1986) Fix issue where `@format` was accidentally required for the `<REPL>` component ([@NullVoxPopuli](https://github.com/NullVoxPopuli))

#### Committers: 1
- [@NullVoxPopuli](https://github.com/NullVoxPopuli)

## Release (2025-09-28)

* ember-repl 7.0.0 (major)
* limber-ui 4.0.0 (major)
* repl-sdk 1.0.0 (major)
* codemirror-lang-glimdown 2.0.0 (major)
* @glimdown/lezer 2.0.0 (major)
* codemirror-lang-glimmer-js 2.0.0 (major)
* @glimdown/lezer-glimmer-expression 2.0.0 (major)
* codemirror-lang-glimmer-ts 2.0.0 (major)
* codemirror-lang-glimmer 2.0.0 (major)
* lezer-glimmer 2.0.0 (major)

#### :boom: Breaking Change
* `ember-repl`, `limber-ui`
  * [#1962](https://github.com/NullVoxPopuli/limber/pull/1962) Docs + <REPL> enhancements ([@NullVoxPopuli](https://github.com/NullVoxPopuli))
* `ember-repl`, `repl-sdk`, `codemirror-lang-glimdown`, `@glimdown/lezer`, `codemirror-lang-glimmer-js`, `@glimdown/lezer-glimmer-expression`, `codemirror-lang-glimmer-ts`, `codemirror-lang-glimmer`, `lezer-glimmer`
  * [#1925](https://github.com/NullVoxPopuli/limber/pull/1925) new repl infra (enabling importing from CDN (no v1 addons)) ([@NullVoxPopuli](https://github.com/NullVoxPopuli))

#### :rocket: Enhancement
* `ember-repl`, `limber-ui`
  * [#1962](https://github.com/NullVoxPopuli/limber/pull/1962) Docs + <REPL> enhancements ([@NullVoxPopuli](https://github.com/NullVoxPopuli))
* `ember-repl`
  * [#1975](https://github.com/NullVoxPopuli/limber/pull/1975) Add collections ([@NullVoxPopuli](https://github.com/NullVoxPopuli))
  * [#1914](https://github.com/NullVoxPopuli/limber/pull/1914) Upgrade template-compilation ([@NullVoxPopuli](https://github.com/NullVoxPopuli))
* `repl-sdk`
  * [#1950](https://github.com/NullVoxPopuli/limber/pull/1950) Add Vanilla JS ([@NullVoxPopuli](https://github.com/NullVoxPopuli))
* `ember-repl`, `repl-sdk`, `codemirror-lang-glimdown`, `codemirror-lang-glimmer-js`
  * [#1947](https://github.com/NullVoxPopuli/limber/pull/1947) Better editor bundling, adding codemirror to repl-sdk so others can boot up the same editor ([@NullVoxPopuli](https://github.com/NullVoxPopuli))
* `ember-repl`, `repl-sdk`, `codemirror-lang-glimdown`, `@glimdown/lezer`, `codemirror-lang-glimmer-js`, `@glimdown/lezer-glimmer-expression`, `codemirror-lang-glimmer-ts`, `codemirror-lang-glimmer`, `lezer-glimmer`
  * [#1925](https://github.com/NullVoxPopuli/limber/pull/1925) new repl infra (enabling importing from CDN (no v1 addons)) ([@NullVoxPopuli](https://github.com/NullVoxPopuli))
* Other
  * [#1917](https://github.com/NullVoxPopuli/limber/pull/1917) Fix doc swapping and loading ([@NullVoxPopuli](https://github.com/NullVoxPopuli))

#### :bug: Bug Fix
* `repl-sdk`
  * [#1965](https://github.com/NullVoxPopuli/limber/pull/1965) Try to fix Svelte ([@NullVoxPopuli](https://github.com/NullVoxPopuli))
* `ember-repl`, `repl-sdk`, `codemirror-lang-glimdown`, `@glimdown/lezer`, `codemirror-lang-glimmer-js`, `@glimdown/lezer-glimmer-expression`, `codemirror-lang-glimmer-ts`, `codemirror-lang-glimmer`, `lezer-glimmer`
  * [#1958](https://github.com/NullVoxPopuli/limber/pull/1958) Closes [#1955](https://github.com/NullVoxPopuli/limber/issues/1955) ([@NullVoxPopuli](https://github.com/NullVoxPopuli))
* Other
  * [#1957](https://github.com/NullVoxPopuli/limber/pull/1957) Closes [#1956](https://github.com/NullVoxPopuli/limber/issues/1956) ([@NullVoxPopuli](https://github.com/NullVoxPopuli))
  * [#1904](https://github.com/NullVoxPopuli/limber/pull/1904) Tutorial navigation selected state ([@tcjr](https://github.com/tcjr))
* `ember-repl`, `repl-sdk`
  * [#1943](https://github.com/NullVoxPopuli/limber/pull/1943) Get tests passing + minor dependency fixes ([@NullVoxPopuli](https://github.com/NullVoxPopuli))

#### :memo: Documentation
* Other
  * [#1982](https://github.com/NullVoxPopuli/limber/pull/1982) docs(contributor): contributors readme action update ([@github-actions[bot]](https://github.com/apps/github-actions))
  * [#1936](https://github.com/NullVoxPopuli/limber/pull/1936) Update prose.md ([@NullVoxPopuli](https://github.com/NullVoxPopuli))
  * [#1929](https://github.com/NullVoxPopuli/limber/pull/1929) Remove unused option block ([@mrloop](https://github.com/mrloop))
  * [#1928](https://github.com/NullVoxPopuli/limber/pull/1928) Rename swapi.dev to swapi.tech ([@mrloop](https://github.com/mrloop))
  * [#1918](https://github.com/NullVoxPopuli/limber/pull/1918) Bring back helpers/state import ([@NullVoxPopuli](https://github.com/NullVoxPopuli))
  * [#1904](https://github.com/NullVoxPopuli/limber/pull/1904) Tutorial navigation selected state ([@tcjr](https://github.com/tcjr))
* `ember-repl`
  * [#1976](https://github.com/NullVoxPopuli/limber/pull/1976) Add comment about warp-drive ([@NullVoxPopuli](https://github.com/NullVoxPopuli))
  * [#1930](https://github.com/NullVoxPopuli/limber/pull/1930) Update keepLatest README example ([@mrloop](https://github.com/mrloop))
  * [#1922](https://github.com/NullVoxPopuli/limber/pull/1922) Try to use RFC #931 ([@NullVoxPopuli](https://github.com/NullVoxPopuli))
* `repl-sdk`
  * [#1973](https://github.com/NullVoxPopuli/limber/pull/1973) Enable the editor param and allow it to specify the initial vertical or horizontal split ([@NullVoxPopuli](https://github.com/NullVoxPopuli))
* `ember-repl`, `repl-sdk`, `codemirror-lang-glimdown`, `@glimdown/lezer`, `codemirror-lang-glimmer-js`, `@glimdown/lezer-glimmer-expression`, `codemirror-lang-glimmer-ts`, `codemirror-lang-glimmer`, `lezer-glimmer`
  * [#1925](https://github.com/NullVoxPopuli/limber/pull/1925) new repl infra (enabling importing from CDN (no v1 addons)) ([@NullVoxPopuli](https://github.com/NullVoxPopuli))

#### :house: Internal
* `ember-repl`, `repl-sdk`, `codemirror-lang-glimdown`, `@glimdown/lezer`, `codemirror-lang-glimmer-js`, `@glimdown/lezer-glimmer-expression`, `codemirror-lang-glimmer-ts`, `codemirror-lang-glimmer`, `lezer-glimmer`
  * [#1974](https://github.com/NullVoxPopuli/limber/pull/1974) Move from nested apps to renderComponent ([@NullVoxPopuli](https://github.com/NullVoxPopuli))
* `ember-repl`
  * [#1970](https://github.com/NullVoxPopuli/limber/pull/1970) Add URL to imports in compiler service ([@NullVoxPopuli](https://github.com/NullVoxPopuli))
  * [#1954](https://github.com/NullVoxPopuli/limber/pull/1954) Update core libraries ([@NullVoxPopuli](https://github.com/NullVoxPopuli))
* Other
  * [#1961](https://github.com/NullVoxPopuli/limber/pull/1961) Remove ember-cli ([@NullVoxPopuli](https://github.com/NullVoxPopuli))
  * [#1952](https://github.com/NullVoxPopuli/limber/pull/1952) Add vite bundle analyzer ([@NullVoxPopuli](https://github.com/NullVoxPopuli))
  * [#1906](https://github.com/NullVoxPopuli/limber/pull/1906) Upgrade ember-primitives, use KeyCombo component ([@NullVoxPopuli](https://github.com/NullVoxPopuli))
  * [#1905](https://github.com/NullVoxPopuli/limber/pull/1905) Improve share dialog ([@NullVoxPopuli](https://github.com/NullVoxPopuli))
  * [#1902](https://github.com/NullVoxPopuli/limber/pull/1902) Update ember-primitives ([@NullVoxPopuli](https://github.com/NullVoxPopuli))
* `ember-repl`, `repl-sdk`, `codemirror-lang-glimdown`, `codemirror-lang-glimmer-js`, `codemirror-lang-glimmer-ts`, `codemirror-lang-glimmer`
  * [#1953](https://github.com/NullVoxPopuli/limber/pull/1953) Update deps ([@NullVoxPopuli](https://github.com/NullVoxPopuli))
* `ember-repl`, `repl-sdk`
  * [#1943](https://github.com/NullVoxPopuli/limber/pull/1943) Get tests passing + minor dependency fixes ([@NullVoxPopuli](https://github.com/NullVoxPopuli))
* `ember-repl`, `codemirror-lang-glimdown`, `@glimdown/lezer`, `codemirror-lang-glimmer-js`, `@glimdown/lezer-glimmer-expression`, `codemirror-lang-glimmer-ts`, `codemirror-lang-glimmer`, `lezer-glimmer`
  * [#1921](https://github.com/NullVoxPopuli/limber/pull/1921) Convert ember-repl test-app to vite. ([@NullVoxPopuli](https://github.com/NullVoxPopuli))

#### Committers: 4
- Ewan McDougall ([@mrloop](https://github.com/mrloop))
- Tom Carter ([@tcjr](https://github.com/tcjr))
- [@NullVoxPopuli](https://github.com/NullVoxPopuli)
- [@github-actions[bot]](https://github.com/apps/github-actions)

## Release (2025-03-03)

limber-ui 3.0.0 (major)
ember-repl 6.0.0 (major)
codemirror-lang-glimdown 1.0.0 (major)
@glimdown/lezer 1.0.0 (major)
codemirror-lang-glimmer-js 1.0.0 (major)
@glimdown/lezer-glimmer-expression 1.0.0 (major)
codemirror-lang-glimmer-ts 1.0.0 (major)
codemirror-lang-glimmer 1.0.0 (major)
lezer-glimmer 1.0.0 (major)

#### :boom: Breaking Change
* `limber`, `tutorial`, `dev-tools`, `@nullvoxpopuli/limber-codemirror`, `limber-ui`, `@nullvoxpopuli/limber-styles`, `@nullvoxpopuli/limber-transpilation`, `@nullvoxpopuli/limber-consts`, `ember-repl`, `ember-repl-test-app`, `@nullvoxpopuli/horizon-theme`, `@glimdown/lezer-infra`, `@glimdown/codemirror-dev-preview`, `codemirror-lang-glimdown`, `@glimdown/lezer`, `codemirror-lang-glimmer-js`, `@glimdown/lezer-glimmer-expression`, `codemirror-lang-glimmer-ts`, `codemirror-lang-glimmer`, `lezer-glimmer`, `@nullvoxpopuli/spike-url-shortening`
  * [#1898](https://github.com/NullVoxPopuli/limber/pull/1898) Vite repl ([@NullVoxPopuli](https://github.com/NullVoxPopuli))

#### :rocket: Enhancement
* `limber`
  * [#1895](https://github.com/NullVoxPopuli/limber/pull/1895) Save last format and document in localStorage ([@NullVoxPopuli](https://github.com/NullVoxPopuli))

#### :memo: Documentation
* `tutorial`
  * [#1894](https://github.com/NullVoxPopuli/limber/pull/1894) new tutorial chapter: conditional event handling ([@NullVoxPopuli](https://github.com/NullVoxPopuli))
  * [#1893](https://github.com/NullVoxPopuli/limber/pull/1893) Update prompt.gjs ([@NullVoxPopuli](https://github.com/NullVoxPopuli))
* `limber`, `tutorial`, `limber-ui`, `@nullvoxpopuli/limber-transpilation`, `ember-repl`, `ember-repl-test-app`, `@glimdown/lezer-infra`, `codemirror-lang-glimdown`, `@glimdown/lezer`, `codemirror-lang-glimmer-js`, `@glimdown/lezer-glimmer-expression`, `codemirror-lang-glimmer-ts`, `codemirror-lang-glimmer`, `lezer-glimmer`
  * [#1872](https://github.com/NullVoxPopuli/limber/pull/1872) Upgrade to ember 6 ([@NullVoxPopuli](https://github.com/NullVoxPopuli))

#### :house: Internal
* `limber`, `tutorial`, `limber-ui`, `ember-repl`, `ember-repl-test-app`
  * [#1882](https://github.com/NullVoxPopuli/limber/pull/1882) Upgrade ember-test-waiters ([@NullVoxPopuli](https://github.com/NullVoxPopuli))

#### Committers: 1
- [@NullVoxPopuli](https://github.com/NullVoxPopuli)

## Release (2024-11-12)

ember-repl 5.0.1 (patch)

#### :bug: Bug Fix
* `ember-repl`
  * [#1868](https://github.com/NullVoxPopuli/limber/pull/1868) Fix ESM compatibility (Vite) ([@NullVoxPopuli](https://github.com/NullVoxPopuli))

#### Committers: 1
- [@NullVoxPopuli](https://github.com/NullVoxPopuli)

## Release (2024-11-12)

limber-ui 2.0.0 (major)
ember-repl 5.0.0 (major)

#### :boom: Breaking Change
* `limber-ui`, `ember-repl`
  * [#1675](https://github.com/NullVoxPopuli/limber/pull/1675) Use decorator transforms ([@NullVoxPopuli](https://github.com/NullVoxPopuli))

#### :rocket: Enhancement
* `ember-repl`
  * [#1867](https://github.com/NullVoxPopuli/limber/pull/1867) Upgrade content-tag in ember-repl to v3 ([@NullVoxPopuli](https://github.com/NullVoxPopuli))
* `limber`, `ember-repl`
  * [#1862](https://github.com/NullVoxPopuli/limber/pull/1862) Cleanup a bit. ([@NullVoxPopuli](https://github.com/NullVoxPopuli))
* `limber-ui`, `ember-repl`
  * [#1675](https://github.com/NullVoxPopuli/limber/pull/1675) Use decorator transforms ([@NullVoxPopuli](https://github.com/NullVoxPopuli))
* `limber`
  * [#1858](https://github.com/NullVoxPopuli/limber/pull/1858) Improve format switching with default content ([@NullVoxPopuli](https://github.com/NullVoxPopuli))

#### Committers: 1
- [@NullVoxPopuli](https://github.com/NullVoxPopuli)

## Release (2024-11-05)

ember-repl 4.3.4 (patch)

#### :bug: Bug Fix
* `ember-repl`
  * [#1859](https://github.com/NullVoxPopuli/limber/pull/1859) Fix vite support (attempt 2) ([@NullVoxPopuli](https://github.com/NullVoxPopuli))

#### Committers: 1
- [@NullVoxPopuli](https://github.com/NullVoxPopuli)

## Release (2024-11-05)

ember-repl 4.3.3 (patch)
codemirror-lang-glimmer-ts 0.0.2 (patch)

#### :rocket: Enhancement
* `limber`
  * [#1851](https://github.com/NullVoxPopuli/limber/pull/1851) Share menu ([@NullVoxPopuli](https://github.com/NullVoxPopuli))

#### :bug: Bug Fix
* `ember-repl`
  * [#1856](https://github.com/NullVoxPopuli/limber/pull/1856) Make the transform function (which uses @babel/standalone) compatible… ([@NullVoxPopuli](https://github.com/NullVoxPopuli))
* `limber`
  * [#1853](https://github.com/NullVoxPopuli/limber/pull/1853) Fix Share Menu, add indicator of copied status ([@NullVoxPopuli](https://github.com/NullVoxPopuli))

#### :house: Internal
* `codemirror-lang-glimmer-ts`
  * [#1857](https://github.com/NullVoxPopuli/limber/pull/1857) Fix build with preparation for gts syntax support for codemirror ([@NullVoxPopuli](https://github.com/NullVoxPopuli))

#### Committers: 1
- [@NullVoxPopuli](https://github.com/NullVoxPopuli)

## Release (2024-11-02)

limber-ui 1.0.5 (patch)
ember-repl 4.3.2 (patch)
codemirror-lang-glimdown 0.0.4 (patch)
@glimdown/lezer 0.0.3 (patch)
codemirror-lang-glimmer-js 0.0.4 (patch)
@glimdown/lezer-glimmer-expression 0.0.3 (patch)
codemirror-lang-glimmer 0.0.4 (patch)
lezer-glimmer 0.0.3 (patch)

#### :rocket: Enhancement
* `limber`
  * [#1848](https://github.com/NullVoxPopuli/limber/pull/1848) URL Shortener ([@NullVoxPopuli](https://github.com/NullVoxPopuli))
* `limber`, `@nullvoxpopuli/limber-codemirror`
  * [#1841](https://github.com/NullVoxPopuli/limber/pull/1841) Upgrade to XState 5 ([@NullVoxPopuli](https://github.com/NullVoxPopuli))

#### :bug: Bug Fix
* `limber`
  * [#1817](https://github.com/NullVoxPopuli/limber/pull/1817) Fix the copy button (when copying snippets) ([@NullVoxPopuli](https://github.com/NullVoxPopuli))

#### :memo: Documentation
* `tutorial`
  * [#1152](https://github.com/NullVoxPopuli/limber/pull/1152) New tutorial chapter: dependent select dropdowns ([@MehulKChaudhari](https://github.com/MehulKChaudhari))
  * [#1807](https://github.com/NullVoxPopuli/limber/pull/1807) Fix unfinished tutorial hiding ([@NullVoxPopuli](https://github.com/NullVoxPopuli))
  * [#1802](https://github.com/NullVoxPopuli/limber/pull/1802) Remove importable modules, as we are only using markdown here ([@NullVoxPopuli](https://github.com/NullVoxPopuli))
* Other
  * [#1812](https://github.com/NullVoxPopuli/limber/pull/1812) Add landing page ([@NullVoxPopuli](https://github.com/NullVoxPopuli))
* `limber`, `limber-ui`
  * [#1801](https://github.com/NullVoxPopuli/limber/pull/1801) External fonts can cost 100ms of load time (unless preloaded in html's head) ([@NullVoxPopuli](https://github.com/NullVoxPopuli))

#### :house: Internal
* `limber`, `tutorial`, `limber-ui-test-app`, `ember-repl-test-app`
  * [#1849](https://github.com/NullVoxPopuli/limber/pull/1849) Bump ember-auto-import to 2.9, remove patch on ember-fontawesome ([@NullVoxPopuli](https://github.com/NullVoxPopuli))
* `limber`, `tutorial`, `limber-ui`, `limber-ui-test-app`, `@nullvoxpopuli/limber-transpilation`, `ember-repl`, `ember-repl-test-app`
  * [#1847](https://github.com/NullVoxPopuli/limber/pull/1847) Force newer @glimmer/component ([@NullVoxPopuli](https://github.com/NullVoxPopuli))
  * [#1787](https://github.com/NullVoxPopuli/limber/pull/1787) Upgrade ember-source to 5.10 ([@NullVoxPopuli](https://github.com/NullVoxPopuli))
* Other
  * [#1788](https://github.com/NullVoxPopuli/limber/pull/1788) Remove old node polyfills ([@NullVoxPopuli](https://github.com/NullVoxPopuli))
  * [#1831](https://github.com/NullVoxPopuli/limber/pull/1831) Node 22 ([@NullVoxPopuli](https://github.com/NullVoxPopuli))
  * [#1827](https://github.com/NullVoxPopuli/limber/pull/1827) Upgrade pnpm ([@NullVoxPopuli](https://github.com/NullVoxPopuli))
  * [#1821](https://github.com/NullVoxPopuli/limber/pull/1821) Add debug information for the workflow_run event ([@NullVoxPopuli](https://github.com/NullVoxPopuli))
* `limber`, `tutorial`, `dev-tools`, `@nullvoxpopuli/limber-codemirror`, `limber-ui`, `limber-ui-test-app`, `@nullvoxpopuli/limber-styles`, `@nullvoxpopuli/limber-transpilation`, `@nullvoxpopuli/limber-consts`, `ember-repl`, `ember-repl-test-app`, `@nullvoxpopuli/horizon-theme`, `codemirror-lang-glimdown`, `codemirror-lang-glimmer-js`, `codemirror-lang-glimmer`, `lezer-glimmer`
  * [#1832](https://github.com/NullVoxPopuli/limber/pull/1832) Stragglers ([@NullVoxPopuli](https://github.com/NullVoxPopuli))
* `limber`, `tutorial`, `limber-ui`, `limber-ui-test-app`, `ember-repl`, `ember-repl-test-app`
  * [#1830](https://github.com/NullVoxPopuli/limber/pull/1830) Upgrade some runtime deps ([@NullVoxPopuli](https://github.com/NullVoxPopuli))
* `limber`, `tutorial`, `limber-ui`, `limber-ui-test-app`, `ember-repl`, `ember-repl-test-app`, `@glimdown/lezer-infra`, `codemirror-lang-glimdown`, `@glimdown/lezer`, `codemirror-lang-glimmer-js`, `@glimdown/lezer-glimmer-expression`, `codemirror-lang-glimmer`, `lezer-glimmer`, `@nullvoxpopuli/spike-url-shortening`
  * [#1829](https://github.com/NullVoxPopuli/limber/pull/1829) Update build deps ([@NullVoxPopuli](https://github.com/NullVoxPopuli))
* `limber`, `tutorial`, `dev-tools`, `@nullvoxpopuli/limber-codemirror`, `limber-ui`, `limber-ui-test-app`, `@nullvoxpopuli/limber-styles`, `@nullvoxpopuli/limber-transpilation`, `@nullvoxpopuli/limber-consts`, `ember-repl`, `ember-repl-test-app`, `@nullvoxpopuli/horizon-theme`, `@glimdown/lezer-infra`, `@glimdown/codemirror-dev-preview`, `codemirror-lang-glimdown`, `@glimdown/lezer`, `codemirror-lang-glimmer-js`, `@glimdown/lezer-glimmer-expression`, `codemirror-lang-glimmer`, `lezer-glimmer`, `@nullvoxpopuli/limber-untyped`, `@nullvoxpopuli/spike-unified`, `@nullvoxpopuli/spike-url-shortening`
  * [#1828](https://github.com/NullVoxPopuli/limber/pull/1828) Update codemirror ([@NullVoxPopuli](https://github.com/NullVoxPopuli))
  * [#1826](https://github.com/NullVoxPopuli/limber/pull/1826) lints ([@NullVoxPopuli](https://github.com/NullVoxPopuli))
  * [#1818](https://github.com/NullVoxPopuli/limber/pull/1818) Upgrade some things ([@NullVoxPopuli](https://github.com/NullVoxPopuli))
* `limber`, `tutorial`, `limber-ui`, `limber-ui-test-app`, `ember-repl`, `ember-repl-test-app`, `@nullvoxpopuli/limber-untyped`
  * [#1824](https://github.com/NullVoxPopuli/limber/pull/1824) Use @glint/*@unstable ([@NullVoxPopuli](https://github.com/NullVoxPopuli))
* `limber`, `tutorial`, `dev-tools`, `@nullvoxpopuli/limber-codemirror`, `limber-ui`, `limber-ui-test-app`, `@nullvoxpopuli/limber-styles`, `@nullvoxpopuli/limber-transpilation`, `@nullvoxpopuli/limber-consts`, `ember-repl`, `ember-repl-test-app`, `@nullvoxpopuli/horizon-theme`, `@glimdown/lezer-infra`, `@glimdown/codemirror-dev-preview`, `codemirror-lang-glimdown`, `@glimdown/lezer`, `codemirror-lang-glimmer-js`, `@glimdown/lezer-glimmer-expression`, `codemirror-lang-glimmer`, `lezer-glimmer`
  * [#1823](https://github.com/NullVoxPopuli/limber/pull/1823) Upgrade babel ([@NullVoxPopuli](https://github.com/NullVoxPopuli))
* `limber`, `tutorial`, `limber-ui-test-app`, `ember-repl`, `ember-repl-test-app`
  * [#1816](https://github.com/NullVoxPopuli/limber/pull/1816) Upgrade to @ember/test-helpers@v4 ([@NullVoxPopuli](https://github.com/NullVoxPopuli))
* `codemirror-lang-glimdown`, `@glimdown/lezer`, `codemirror-lang-glimmer-js`, `codemirror-lang-glimmer`, `@nullvoxpopuli/spike-url-shortening`
  * [#1806](https://github.com/NullVoxPopuli/limber/pull/1806) Upgrade vite ([@NullVoxPopuli](https://github.com/NullVoxPopuli))

#### Committers: 2
- Mehul Kiran Chaudhari ([@MehulKChaudhari](https://github.com/MehulKChaudhari))
- [@NullVoxPopuli](https://github.com/NullVoxPopuli)

## Release (2024-07-21)

limber-ui 1.0.4 (patch)
ember-repl 4.3.1 (patch)
codemirror-lang-glimdown 0.0.3 (patch)
codemirror-lang-glimmer-js 0.0.3 (patch)
codemirror-lang-glimmer 0.0.3 (patch)

#### :bug: Bug Fix
* `ember-repl`, `ember-repl-test-app`
  * [#1800](https://github.com/NullVoxPopuli/limber/pull/1800) when compiling gdm, fix an issue with (not) escaping {{ }} within inline code tags ([@NullVoxPopuli](https://github.com/NullVoxPopuli))

#### :memo: Documentation
* `limber`, `tutorial`, `@nullvoxpopuli/limber-codemirror`, `limber-ui`, `limber-ui-test-app`, `@nullvoxpopuli/limber-transpilation`, `ember-repl`, `ember-repl-test-app`, `@glimdown/lezer-infra`, `codemirror-lang-glimdown`, `codemirror-lang-glimmer-js`, `codemirror-lang-glimmer`
  * [#1789](https://github.com/NullVoxPopuli/limber/pull/1789) Begin usage of Kolay (latest) in the tutorial ([@NullVoxPopuli](https://github.com/NullVoxPopuli))
* `tutorial`
  * [#1793](https://github.com/NullVoxPopuli/limber/pull/1793) Fixed issue #1792: Used of modifier instead of component. ([@bitxplora](https://github.com/bitxplora))
  * [#1791](https://github.com/NullVoxPopuli/limber/pull/1791) Update htmlSafe prose.md ([@johnpatrickanders](https://github.com/johnpatrickanders))
  * [#1790](https://github.com/NullVoxPopuli/limber/pull/1790) Update 4-logic/10-unless-block answer.gjs ([@johnpatrickanders](https://github.com/johnpatrickanders))

#### :house: Internal
* [#1783](https://github.com/NullVoxPopuli/limber/pull/1783) Update deploy-preview.yml ([@NullVoxPopuli](https://github.com/NullVoxPopuli))

#### Committers: 3
- 'Dayo Olutayo ([@bitxplora](https://github.com/bitxplora))
- John Anders ([@johnpatrickanders](https://github.com/johnpatrickanders))
- [@NullVoxPopuli](https://github.com/NullVoxPopuli)

## Release (2024-06-24)

limber-ui 1.0.3 (patch)
ember-repl 4.3.0 (minor)
codemirror-lang-glimdown 0.0.2 (patch)
@glimdown/lezer 0.0.2 (patch)
codemirror-lang-glimmer-js 0.0.2 (patch)
@glimdown/lezer-glimmer-expression 0.0.2 (patch)
codemirror-lang-glimmer 0.0.2 (patch)
lezer-glimmer 0.0.2 (patch)

#### :rocket: Enhancement
* `ember-repl`, `ember-repl-test-app`
  * [#1773](https://github.com/NullVoxPopuli/limber/pull/1773) Run live code extraction after remark plugins ([@NullVoxPopuli](https://github.com/NullVoxPopuli))

#### :memo: Documentation
* `limber`, `ember-repl`
  * [#1769](https://github.com/NullVoxPopuli/limber/pull/1769) Improve visibility for changing the format of the document / editor (gjs/hbs/gmd) ([@NullVoxPopuli](https://github.com/NullVoxPopuli))
* `tutorial`
  * [#1758](https://github.com/NullVoxPopuli/limber/pull/1758) Controlled Inputs ([@NullVoxPopuli](https://github.com/NullVoxPopuli))
  * [#1755](https://github.com/NullVoxPopuli/limber/pull/1755) Typo ([@shaedrich](https://github.com/shaedrich))
  * [#1732](https://github.com/NullVoxPopuli/limber/pull/1732) Update ember-resources chapters ([@NullVoxPopuli](https://github.com/NullVoxPopuli))

#### :house: Internal
* `@nullvoxpopuli/limber-styles`
  * [#1765](https://github.com/NullVoxPopuli/limber/pull/1765) Upgrade turbo ([@NullVoxPopuli](https://github.com/NullVoxPopuli))
* `limber`, `tutorial`, `limber-ui`, `limber-ui-test-app`, `@nullvoxpopuli/limber-transpilation`, `ember-repl-test-app`
  * [#1768](https://github.com/NullVoxPopuli/limber/pull/1768) Upgrade more deps ([@NullVoxPopuli](https://github.com/NullVoxPopuli))
* `limber`, `@nullvoxpopuli/limber-codemirror`, `limber-ui`, `ember-repl`, `@glimdown/lezer-infra`, `codemirror-lang-glimdown`, `codemirror-lang-glimmer-js`, `codemirror-lang-glimmer`
  * [#1767](https://github.com/NullVoxPopuli/limber/pull/1767) Update codemirror ([@NullVoxPopuli](https://github.com/NullVoxPopuli))
* `limber`, `tutorial`, `limber-ui`, `limber-ui-test-app`, `@nullvoxpopuli/limber-transpilation`, `ember-repl`, `ember-repl-test-app`
  * [#1766](https://github.com/NullVoxPopuli/limber/pull/1766) Upgrade embroider deps ([@NullVoxPopuli](https://github.com/NullVoxPopuli))
  * [#1760](https://github.com/NullVoxPopuli/limber/pull/1760) Update ember-source ([@NullVoxPopuli](https://github.com/NullVoxPopuli))
* `ember-repl-test-app`
  * [#1764](https://github.com/NullVoxPopuli/limber/pull/1764) Reroll the lockfile ([@NullVoxPopuli](https://github.com/NullVoxPopuli))
* `limber`, `tutorial`, `@nullvoxpopuli/limber-transpilation`, `ember-repl-test-app`
  * [#1745](https://github.com/NullVoxPopuli/limber/pull/1745) pnpm 9 ([@NullVoxPopuli](https://github.com/NullVoxPopuli))
* `limber`, `tutorial`, `dev-tools`, `@nullvoxpopuli/limber-codemirror`, `limber-ui`, `limber-ui-test-app`, `@nullvoxpopuli/limber-styles`, `@nullvoxpopuli/limber-transpilation`, `@nullvoxpopuli/limber-consts`, `ember-repl`, `ember-repl-test-app`, `@nullvoxpopuli/horizon-theme`, `@glimdown/lezer-infra`, `@glimdown/codemirror-dev-preview`, `codemirror-lang-glimdown`, `@glimdown/lezer`, `codemirror-lang-glimmer-js`, `@glimdown/lezer-glimmer-expression`, `codemirror-lang-glimmer`, `lezer-glimmer`, `@nullvoxpopuli/limber-untyped`, `@nullvoxpopuli/spike-unified`, `@nullvoxpopuli/spike-url-shortening`
  * [#1744](https://github.com/NullVoxPopuli/limber/pull/1744) lol, no way ([@NullVoxPopuli](https://github.com/NullVoxPopuli))
* `tutorial`
  * [#1734](https://github.com/NullVoxPopuli/limber/pull/1734) Make a change ([@NullVoxPopuli](https://github.com/NullVoxPopuli))
  * [#1733](https://github.com/NullVoxPopuli/limber/pull/1733) Cloudflare Functions for better 404s ([@NullVoxPopuli](https://github.com/NullVoxPopuli))

#### Committers: 2
- Sebastian Hädrich ([@shaedrich](https://github.com/shaedrich))
- [@NullVoxPopuli](https://github.com/NullVoxPopuli)

## Release (2024-04-24)

limber-ui 1.0.2 (patch)
ember-repl 4.2.1 (patch)
codemirror-lang-glimdown 0.0.1 (patch)
@glimdown/lezer 0.0.1 (patch)
codemirror-lang-glimmer-js 0.0.1 (patch)
@glimdown/lezer-glimmer-expression 0.0.1 (patch)
codemirror-lang-glimmer 0.0.1 (patch)
lezer-glimmer 0.0.1 (patch)

#### :bug: Bug Fix
* `limber-ui`, `ember-repl`, `codemirror-lang-glimdown`, `@glimdown/lezer`, `codemirror-lang-glimmer-js`, `@glimdown/lezer-glimmer-expression`, `codemirror-lang-glimmer`, `lezer-glimmer`
  * [#1729](https://github.com/NullVoxPopuli/limber/pull/1729) Remove engines from runtime / browser packages ([@NullVoxPopuli](https://github.com/NullVoxPopuli))

#### :memo: Documentation
* [#1681](https://github.com/NullVoxPopuli/limber/pull/1681) Update dependency ember-container-query to v5.0.7 ([@renovate[bot]](https://github.com/apps/renovate))

#### :house: Internal
* `limber-ui`, `ember-repl`, `codemirror-lang-glimdown`, `@glimdown/lezer`, `codemirror-lang-glimmer-js`, `@glimdown/lezer-glimmer-expression`, `codemirror-lang-glimmer`, `lezer-glimmer`
  * [#1729](https://github.com/NullVoxPopuli/limber/pull/1729) Remove engines from runtime / browser packages ([@NullVoxPopuli](https://github.com/NullVoxPopuli))
* Other
  * [#1372](https://github.com/NullVoxPopuli/limber/pull/1372) specify node-version ([@NullVoxPopuli](https://github.com/NullVoxPopuli))
  * [#1702](https://github.com/NullVoxPopuli/limber/pull/1702) Update pnpm to v8.15.4 ([@renovate[bot]](https://github.com/apps/renovate))
* `limber-ui`, `ember-repl`
  * [#1701](https://github.com/NullVoxPopuli/limber/pull/1701) Update devDependencies ([@renovate[bot]](https://github.com/apps/renovate))
  * [#1713](https://github.com/NullVoxPopuli/limber/pull/1713) Update dependency @embroider/macros to v1.15.0 ([@renovate[bot]](https://github.com/apps/renovate))
* `codemirror-lang-glimmer`
  * [#1678](https://github.com/NullVoxPopuli/limber/pull/1678) Update CodeMirror ([@renovate[bot]](https://github.com/apps/renovate))

#### Committers: 1
- [@NullVoxPopuli](https://github.com/NullVoxPopuli)

## Release (2024-03-12)

ember-repl 4.2.0 (minor)

#### :rocket: Enhancement
* `ember-repl`
  * [#1710](https://github.com/NullVoxPopuli/limber/pull/1710) Re-export some types from ember-repl ([@NullVoxPopuli](https://github.com/NullVoxPopuli))

#### :memo: Documentation
* [#1709](https://github.com/NullVoxPopuli/limber/pull/1709) Rename swapi.dev to swapi.tech ([@NullVoxPopuli](https://github.com/NullVoxPopuli))

#### Committers: 1
- [@NullVoxPopuli](https://github.com/NullVoxPopuli)

## Release (2024-03-12)

limber-ui 1.0.1 (patch)
ember-repl 4.1.2 (patch)

#### :bug: Bug Fix
* `ember-repl`
  * [#1708](https://github.com/NullVoxPopuli/limber/pull/1708) Add rehypePlugins to ExtraOptions, used by compile ([@NullVoxPopuli](https://github.com/NullVoxPopuli))

#### :memo: Documentation
* `limber-ui`, `ember-repl`
  * [#1706](https://github.com/NullVoxPopuli/limber/pull/1706) Add @includeStyles to <Shadowed> ([@NullVoxPopuli](https://github.com/NullVoxPopuli))

#### Committers: 1
- [@NullVoxPopuli](https://github.com/NullVoxPopuli)

## Release (2024-03-11)

ember-repl 4.1.1 (patch)

#### :bug: Bug Fix
* `ember-repl`
  * [#1704](https://github.com/NullVoxPopuli/limber/pull/1704) Escape {{ after the rehype phase instead of during the remark phase ([@NullVoxPopuli](https://github.com/NullVoxPopuli))

#### Committers: 1
- [@NullVoxPopuli](https://github.com/NullVoxPopuli)

## Release (2024-03-10)

ember-repl 4.1.0 (minor)

#### :rocket: Enhancement
* `ember-repl`
  * [#1699](https://github.com/NullVoxPopuli/limber/pull/1699) Allow plugin options for both remark and rehype plugins ([@NullVoxPopuli](https://github.com/NullVoxPopuli))

#### Committers: 1
- [@NullVoxPopuli](https://github.com/NullVoxPopuli)

## Release (2024-03-10)

ember-repl 4.0.3 (patch)

#### :bug: Bug Fix
* `ember-repl`
  * [#1697](https://github.com/NullVoxPopuli/limber/pull/1697) Fix ember repl build + use turbo in publish.yml ([@NullVoxPopuli](https://github.com/NullVoxPopuli))

#### Committers: 1
- [@NullVoxPopuli](https://github.com/NullVoxPopuli)

## Release (2024-03-10)

ember-repl 4.0.2 (patch)

#### :bug: Bug Fix
* `ember-repl`
  * [#1695](https://github.com/NullVoxPopuli/limber/pull/1695) Fix ember-repl publish ([@NullVoxPopuli](https://github.com/NullVoxPopuli))

#### Committers: 1
- [@NullVoxPopuli](https://github.com/NullVoxPopuli)

## Release (2024-03-10)

ember-repl 4.0.1 (patch)

#### :bug: Bug Fix
* `ember-repl`
  * [#1693](https://github.com/NullVoxPopuli/limber/pull/1693) Fix issue where rehypePlugins were not passed through all the way through to the markdown compiler ([@NullVoxPopuli](https://github.com/NullVoxPopuli))

#### Committers: 1
- [@NullVoxPopuli](https://github.com/NullVoxPopuli)

## Release (2024-03-10)

ember-repl 4.0.0 (major)

#### :boom: Breaking Change
* `ember-repl`
  * [#1674](https://github.com/NullVoxPopuli/limber/pull/1674) Refactor the compilation library to prepare for broader usage ([@NullVoxPopuli](https://github.com/NullVoxPopuli))
  * [#1672](https://github.com/NullVoxPopuli/limber/pull/1672) [ember-repl] remove broccoli plugin for generating a 'component map' ([@NullVoxPopuli](https://github.com/NullVoxPopuli))

#### :rocket: Enhancement
* `ember-repl`
  * [#1687](https://github.com/NullVoxPopuli/limber/pull/1687) Allow passing rehype plugins to the markdown renderer in ember-repl ([@NullVoxPopuli](https://github.com/NullVoxPopuli))
  * [#1674](https://github.com/NullVoxPopuli/limber/pull/1674) Refactor the compilation library to prepare for broader usage ([@NullVoxPopuli](https://github.com/NullVoxPopuli))

#### :bug: Bug Fix
* [#1642](https://github.com/NullVoxPopuli/limber/pull/1642) Fix for #1641: Alternative 1) Remove `z-10` from resize-handle ([@johanrd](https://github.com/johanrd))

#### :memo: Documentation
* [#1618](https://github.com/NullVoxPopuli/limber/pull/1618) Add note about trying out Polaris ([@NullVoxPopuli](https://github.com/NullVoxPopuli))
* [#1680](https://github.com/NullVoxPopuli/limber/pull/1680) feat: Arg Components ([@MichalBryxi](https://github.com/MichalBryxi))

#### :house: Internal
* [#1691](https://github.com/NullVoxPopuli/limber/pull/1691) Try out a github-changelog fix ([@NullVoxPopuli](https://github.com/NullVoxPopuli))
* [#1690](https://github.com/NullVoxPopuli/limber/pull/1690) Try this release-plan fix branch ([@NullVoxPopuli](https://github.com/NullVoxPopuli))
* [#1689](https://github.com/NullVoxPopuli/limber/pull/1689) Try release-plan fix  ([@NullVoxPopuli](https://github.com/NullVoxPopuli))
* [#1688](https://github.com/NullVoxPopuli/limber/pull/1688) Re-roll lockfile ([@NullVoxPopuli](https://github.com/NullVoxPopuli))
* [#1667](https://github.com/NullVoxPopuli/limber/pull/1667) Update pnpm to v8.15.3 ([@renovate[bot]](https://github.com/apps/renovate))
* [#1676](https://github.com/NullVoxPopuli/limber/pull/1676) Remove skipped tests that have been skipped for years ([@NullVoxPopuli](https://github.com/NullVoxPopuli))
* [#1670](https://github.com/NullVoxPopuli/limber/pull/1670) Release plan ([@NullVoxPopuli](https://github.com/NullVoxPopuli))

#### Committers: 3
- Michal Bryxí ([@MichalBryxi](https://github.com/MichalBryxi))
- [@NullVoxPopuli](https://github.com/NullVoxPopuli)
- [@johanrd](https://github.com/johanrd)
