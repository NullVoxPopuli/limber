# Changelog

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
