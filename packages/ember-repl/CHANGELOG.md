## [2.0.63](https://github.com/NullVoxPopuli/ember-repl/compare/v2.0.62...v2.0.63) (2022-08-23)

## 3.0.0

### Major Changes

- [#896](https://github.com/NullVoxPopuli/limber/pull/896) [`9631cfd`](https://github.com/NullVoxPopuli/limber/commit/9631cfdb5b0a56c6b7c8aa72cd1c75ef65c8d597) Thanks [@NullVoxPopuli](https://github.com/NullVoxPopuli)! - Now compatible with Glint types.

  This is considered a breaking change because the types became _stricter_.

  Previously the `component` property was `unknown`, and now it is `ComponentLike` (from `@glint/template`)

- [#769](https://github.com/NullVoxPopuli/limber/pull/769) [`74490d7`](https://github.com/NullVoxPopuli/limber/commit/74490d767b448381af3b41c60a0a58dbffb3e3ea) Thanks [@NullVoxPopuli](https://github.com/NullVoxPopuli)! - Drop support for ember-source < 4.11.

  This doesn't mean that ember-source < 4.11 won't work with ember-repl, but that ember-repl is not testing against earlier ember-sources.

### Minor Changes

- [#986](https://github.com/NullVoxPopuli/limber/pull/986) [`0e72a5d`](https://github.com/NullVoxPopuli/limber/commit/0e72a5dbddfd9c147d90a12b3e56d8e035ad7945) Thanks [@NullVoxPopuli](https://github.com/NullVoxPopuli)! - Add GitHub-Flavored-Markdown support

- [#950](https://github.com/NullVoxPopuli/limber/pull/950) [`7dcfc53`](https://github.com/NullVoxPopuli/limber/commit/7dcfc5338b9a91e35a419b24330c3679c18632da) Thanks [@NullVoxPopuli](https://github.com/NullVoxPopuli)! - Additional exports:

  - `compile`
  - `Compiled`

  These enable editors to more easily integrate with the multiple formats supported by ember-repl.

  `compile` is an imperative interface where you can provide callbacks for what you'd like to do on success, error, and start of a compilation.

  `Compiled` is a resource for when you don't want to do any of the above, and want just get to rendering. This utility resource is a only a few lines and immediately wraps `compile` while providing 3 reactive values to use directly in your templates.

  See the README for more information.

- [`fa9b78c`](https://github.com/NullVoxPopuli/limber/commit/fa9b78c0786ad523c7ec6096f9b2df5c5da473fc) Thanks [@NullVoxPopuli](https://github.com/NullVoxPopuli)! - Add support for passing `remarkPlugins` to `compile` and `Compile` for the `glimdown` format

### Patch Changes

- [#754](https://github.com/NullVoxPopuli/limber/pull/754) [`ae14517`](https://github.com/NullVoxPopuli/limber/commit/ae1451732dda5ae03c4e100b6851743a99d74ee9) Thanks [@NullVoxPopuli](https://github.com/NullVoxPopuli)! - Use caret ranges (^) for all dependencies

- [`ff2de75`](https://github.com/NullVoxPopuli/limber/commit/ff2de75a7b0269e31dc224fff0d173a252cc26c4) Thanks [@NullVoxPopuli](https://github.com/NullVoxPopuli)! - Fix an issue where hbs live blocks did not have scope properly forwarded to them and make errors about missing scope clearer, rather than 'tried to render undefined, how dare you'

  Fix implemented here: https://github.com/NullVoxPopuli/limber/pull/1668

- [#1258](https://github.com/NullVoxPopuli/limber/pull/1258) [`f0b1c68`](https://github.com/NullVoxPopuli/limber/commit/f0b1c68da309f9fb39864def158539396086c5a5) Thanks [@NullVoxPopuli](https://github.com/NullVoxPopuli)! - Fix types exports by using separate declarations directory in npm package

- [`1a825f9`](https://github.com/NullVoxPopuli/limber/commit/1a825f9c4062d557cf9b7b6adcf7d15800ccc710) Thanks [@NullVoxPopuli](https://github.com/NullVoxPopuli)! - Use WASM-based content-tag for compilation instead of regex-based javascript implementation.

- [`29fd785`](https://github.com/NullVoxPopuli/limber/commit/29fd785d8e44280760f4b9f39248fbaa1b9188ee) - Add option to pass the ShadowComponent to compile"

- [#954](https://github.com/NullVoxPopuli/limber/pull/954) [`c52a615`](https://github.com/NullVoxPopuli/limber/commit/c52a615a5b427032fecc037cc71d983d4cfa9ffe) Thanks [@NullVoxPopuli](https://github.com/NullVoxPopuli)! - Passthrough all options from Compiled to compile

## 3.0.0-beta.7

### Patch Changes

- [`1a825f9c`](https://github.com/NullVoxPopuli/limber/commit/1a825f9c4062d557cf9b7b6adcf7d15800ccc710) Thanks [@NullVoxPopuli](https://github.com/NullVoxPopuli)! - Use WASM-based content-tag for compilation instead of regex-based javascript implementation.

## 3.0.0-beta.6

### Minor Changes

- [`fa9b78c0`](https://github.com/NullVoxPopuli/limber/commit/fa9b78c0786ad523c7ec6096f9b2df5c5da473fc) Thanks [@NullVoxPopuli](https://github.com/NullVoxPopuli)! - Add support for passing `remarkPlugins` to `compile` and `Compile` for the `glimdown` format

## 3.0.0-beta.5

### Patch Changes

- [#1258](https://github.com/NullVoxPopuli/limber/pull/1258) [`f0b1c68d`](https://github.com/NullVoxPopuli/limber/commit/f0b1c68da309f9fb39864def158539396086c5a5) Thanks [@NullVoxPopuli](https://github.com/NullVoxPopuli)! - Fix types exports by using separate declarations directory in npm package

## 3.0.0-beta.4

### Patch Changes

- [#954](https://github.com/NullVoxPopuli/limber/pull/954) [`c52a615a`](https://github.com/NullVoxPopuli/limber/commit/c52a615a5b427032fecc037cc71d983d4cfa9ffe) Thanks [@NullVoxPopuli](https://github.com/NullVoxPopuli)! - Passthrough all options from Compiled to compile

## 3.0.0-beta.3

### Minor Changes

- [#986](https://github.com/NullVoxPopuli/limber/pull/986) [`0e72a5d`](https://github.com/NullVoxPopuli/limber/commit/0e72a5dbddfd9c147d90a12b3e56d8e035ad7945) Thanks [@NullVoxPopuli](https://github.com/NullVoxPopuli)! - Add GitHub-Flavored-Markdown support

## 3.0.0-beta.2

### Patch Changes

- [`29fd785`](https://github.com/NullVoxPopuli/limber/commit/29fd785d8e44280760f4b9f39248fbaa1b9188ee) - Add option to pass the ShadowComponent to compile"

## 3.0.0-beta.1

### Minor Changes

- [#950](https://github.com/NullVoxPopuli/limber/pull/950) [`7dcfc53`](https://github.com/NullVoxPopuli/limber/commit/7dcfc5338b9a91e35a419b24330c3679c18632da) Thanks [@NullVoxPopuli](https://github.com/NullVoxPopuli)! - Additional exports:

  - `compile`
  - `Compiled`

  These enable editors to more easily integrate with the multiple formats supported by ember-repl.

  `compile` is an imperative interface where you can provide callbacks for what you'd like to do on success, error, and start of a compilation.

  `Compiled` is a resource for when you don't want to do any of the above, and want just get to rendering. This utility resource is a only a few lines and immediately wraps `compile` while providing 3 reactive values to use directly in your templates.

  See the README for more information.

## 3.0.0-beta.0

### Major Changes

- [#896](https://github.com/NullVoxPopuli/limber/pull/896) [`9631cfd`](https://github.com/NullVoxPopuli/limber/commit/9631cfdb5b0a56c6b7c8aa72cd1c75ef65c8d597) Thanks [@NullVoxPopuli](https://github.com/NullVoxPopuli)! - Now compatible with Glint types.

  This is considered a breaking change because the types became _stricter_.

  Previously the `component` property was `unknown`, and now it is `ComponentLike` (from `@glint/template`)

- [#769](https://github.com/NullVoxPopuli/limber/pull/769) [`74490d7`](https://github.com/NullVoxPopuli/limber/commit/74490d767b448381af3b41c60a0a58dbffb3e3ea) Thanks [@NullVoxPopuli](https://github.com/NullVoxPopuli)! - Drop support for ember-source < 4.11.

  This doesn't mean that ember-source < 4.11 won't work with ember-repl, but that ember-repl is not testing against earlier ember-sources.

### Patch Changes

- [#754](https://github.com/NullVoxPopuli/limber/pull/754) [`ae14517`](https://github.com/NullVoxPopuli/limber/commit/ae1451732dda5ae03c4e100b6851743a99d74ee9) Thanks [@NullVoxPopuli](https://github.com/NullVoxPopuli)! - Use caret ranges (^) for all dependencies

### Bug Fixes

- **deps:** update dependency @babel/standalone to ^7.18.13 ([47782b6](https://github.com/NullVoxPopuli/ember-repl/commit/47782b679fa77e05aab535cadcf17160a570592f))

## [2.0.62](https://github.com/NullVoxPopuli/ember-repl/compare/v2.0.61...v2.0.62) (2022-08-05)

### Bug Fixes

- **deps:** update dependency @babel/standalone to ^7.18.12 ([a8fa751](https://github.com/NullVoxPopuli/ember-repl/commit/a8fa751fa1f894462d56ae07123bac0c7c63975b))

## [2.0.61](https://github.com/NullVoxPopuli/ember-repl/compare/v2.0.60...v2.0.61) (2022-08-02)

### Bug Fixes

- **deps:** update dependency @babel/standalone to ^7.18.10 ([1eb14f3](https://github.com/NullVoxPopuli/ember-repl/commit/1eb14f3b0ccb2a0679fba87e419e8174f00e07c8))

## [2.0.60](https://github.com/NullVoxPopuli/ember-repl/compare/v2.0.59...v2.0.60) (2022-07-18)

### Bug Fixes

- **deps:** update dependency @babel/standalone to ^7.18.9 ([2d23b82](https://github.com/NullVoxPopuli/ember-repl/commit/2d23b82c5306c6548afeab4a52f6154df5d658b4))

## [2.0.59](https://github.com/NullVoxPopuli/ember-repl/compare/v2.0.58...v2.0.59) (2022-07-08)

### Bug Fixes

- **deps:** update dependency @babel/standalone to ^7.18.8 ([ba01580](https://github.com/NullVoxPopuli/ember-repl/commit/ba0158023c0da95e12f3388336dadfb59de7c2d1))

## [2.0.58](https://github.com/NullVoxPopuli/ember-repl/compare/v2.0.57...v2.0.58) (2022-07-04)

### Bug Fixes

- **deps:** update embroider monorepo to ^1.8.3 ([ef4be4e](https://github.com/NullVoxPopuli/ember-repl/commit/ef4be4e7391b9d266551ae4d7e1fc395909dd299))

## [2.0.57](https://github.com/NullVoxPopuli/ember-repl/compare/v2.0.56...v2.0.57) (2022-07-04)

### Bug Fixes

- **deps:** update dependency ember-cli-htmlbars to ^6.1.0 ([953c0c1](https://github.com/NullVoxPopuli/ember-repl/commit/953c0c15304301e8ed31da5b7320f60a4e835b43))

## [2.0.56](https://github.com/NullVoxPopuli/ember-repl/compare/v2.0.55...v2.0.56) (2022-07-02)

### Bug Fixes

- **deps:** update embroider monorepo to ^1.8.1 ([56c45ec](https://github.com/NullVoxPopuli/ember-repl/commit/56c45ec04094362196f329d978bbea4e494efb46))

## [2.0.55](https://github.com/NullVoxPopuli/ember-repl/compare/v2.0.54...v2.0.55) (2022-06-29)

### Bug Fixes

- **deps:** update dependency @babel/standalone to ^7.18.7 ([b97a3f1](https://github.com/NullVoxPopuli/ember-repl/commit/b97a3f11edfcb4cc82335387c0442f0a27dd3b88))

## [2.0.54](https://github.com/NullVoxPopuli/ember-repl/compare/v2.0.53...v2.0.54) (2022-06-28)

### Bug Fixes

- **deps:** update dependency @babel/standalone to ^7.18.6 ([2b5d6d8](https://github.com/NullVoxPopuli/ember-repl/commit/2b5d6d8e4b78a2b7ecdbc326e7736ed1c6c4e9ac))

## [2.0.53](https://github.com/NullVoxPopuli/ember-repl/compare/v2.0.52...v2.0.53) (2022-06-13)

### Bug Fixes

- **deps:** update dependency @babel/standalone to ^7.18.5 ([fb6e903](https://github.com/NullVoxPopuli/ember-repl/commit/fb6e903e3ceda36a536b38d604b1391bf503792f))

## [2.0.52](https://github.com/NullVoxPopuli/ember-repl/compare/v2.0.51...v2.0.52) (2022-06-10)

### Bug Fixes

- **deps:** update embroider monorepo to ^1.8.0 ([9321f36](https://github.com/NullVoxPopuli/ember-repl/commit/9321f3600dc97759217f80943d03e464db525da4))

## [2.0.51](https://github.com/NullVoxPopuli/ember-repl/compare/v2.0.50...v2.0.51) (2022-05-30)

### Bug Fixes

- **deps:** update dependency @babel/standalone to ^7.18.4 ([d119d4c](https://github.com/NullVoxPopuli/ember-repl/commit/d119d4c562c0c9187ca272e586eb3f4e6f6b981a))

## [2.0.50](https://github.com/NullVoxPopuli/ember-repl/compare/v2.0.49...v2.0.50) (2022-05-25)

### Bug Fixes

- **deps:** update dependency @babel/standalone to ^7.18.3 ([84d6123](https://github.com/NullVoxPopuli/ember-repl/commit/84d61230cd9f82f095ec03283121035e301cd6d4))

## [2.0.49](https://github.com/NullVoxPopuli/ember-repl/compare/v2.0.48...v2.0.49) (2022-05-25)

### Bug Fixes

- **deps:** update dependency @babel/standalone to ^7.18.2 ([7e59178](https://github.com/NullVoxPopuli/ember-repl/commit/7e591785afa3984800b00eb6b940584809368777))

## [2.0.48](https://github.com/NullVoxPopuli/ember-repl/compare/v2.0.47...v2.0.48) (2022-05-24)

### Bug Fixes

- **deps:** update embroider monorepo to ^1.7.1 ([0264c7b](https://github.com/NullVoxPopuli/ember-repl/commit/0264c7b75fc0195a69143e952805d6709a73e1c3))

## [2.0.47](https://github.com/NullVoxPopuli/ember-repl/compare/v2.0.46...v2.0.47) (2022-05-23)

### Bug Fixes

- **deps:** update embroider monorepo to ^1.7.0 ([4e57c24](https://github.com/NullVoxPopuli/ember-repl/commit/4e57c24e5c9c1f9b95ff27cd3f7685e4479d370a))

## [2.0.46](https://github.com/NullVoxPopuli/ember-repl/compare/v2.0.45...v2.0.46) (2022-05-22)

### Bug Fixes

- **deps:** update dependency ember-auto-import to v2.4.2 ([b458903](https://github.com/NullVoxPopuli/ember-repl/commit/b458903b53e5aacc275beeb8bc2341afeca522fc))

## [2.0.45](https://github.com/NullVoxPopuli/ember-repl/compare/v2.0.44...v2.0.45) (2022-05-20)

### Bug Fixes

- **deps:** update dependency @babel/standalone to ^7.18.1 ([eebb0f4](https://github.com/NullVoxPopuli/ember-repl/commit/eebb0f485eb83cb5eeb85ea69b1d83178a19a658))

## [2.0.44](https://github.com/NullVoxPopuli/ember-repl/compare/v2.0.43...v2.0.44) (2022-05-17)

### Bug Fixes

- **deps:** update dependency @babel/standalone to ^7.17.12 ([a7b66d8](https://github.com/NullVoxPopuli/ember-repl/commit/a7b66d8ff1b572975f7ce78e4e499cfa04308f12))

## [2.0.43](https://github.com/NullVoxPopuli/ember-repl/compare/v2.0.42...v2.0.43) (2022-04-30)

### Bug Fixes

- **deps:** update dependency @babel/standalone to ^7.17.11 ([1c3e505](https://github.com/NullVoxPopuli/ember-repl/commit/1c3e505302fff611e43f9f6b65a6af4ad0f1fc86))

## [2.0.42](https://github.com/NullVoxPopuli/ember-repl/compare/v2.0.41...v2.0.42) (2022-04-29)

### Bug Fixes

- **deps:** update dependency @babel/standalone to ^7.17.10 ([7aa0b74](https://github.com/NullVoxPopuli/ember-repl/commit/7aa0b74b3c64bf02f07c879b1d3408e27166876b))

## [2.0.41](https://github.com/NullVoxPopuli/ember-repl/compare/v2.0.40...v2.0.41) (2022-04-21)

### Bug Fixes

- **deps:** update dependency ember-cli-typescript to ^5.1.0 ([a0bff08](https://github.com/NullVoxPopuli/ember-repl/commit/a0bff0823d2afd898774841b8e79db3f46bb77ef))

## [2.0.40](https://github.com/NullVoxPopuli/ember-repl/compare/v2.0.39...v2.0.40) (2022-04-12)

### Bug Fixes

- **deps:** update framework dependencies to ^1.1.2 ([9e7b65c](https://github.com/NullVoxPopuli/ember-repl/commit/9e7b65c357347bbaa6bdd9cfd0b846c23d6a4d73))

## [2.0.39](https://github.com/NullVoxPopuli/ember-repl/compare/v2.0.38...v2.0.39) (2022-04-08)

### Bug Fixes

- **deps:** update embroider monorepo to ^1.6.0 ([f47265b](https://github.com/NullVoxPopuli/ember-repl/commit/f47265b92fde8a776259befed20d9fab83377528))

## [2.0.38](https://github.com/NullVoxPopuli/ember-repl/compare/v2.0.37...v2.0.38) (2022-04-06)

### Bug Fixes

- **deps:** update dependency @babel/standalone to ^7.17.9 ([be2274c](https://github.com/NullVoxPopuli/ember-repl/commit/be2274c8c2741e1676f4d62430a747d03dd5b735))

## [2.0.37](https://github.com/NullVoxPopuli/ember-repl/compare/v2.0.36...v2.0.37) (2022-04-01)

### Bug Fixes

- **deps:** update framework dependencies to ^1.1.1 ([3489552](https://github.com/NullVoxPopuli/ember-repl/commit/34895521b42340444e0b09b4c850cac07a1062cd))

## [2.0.36](https://github.com/NullVoxPopuli/ember-repl/compare/v2.0.35...v2.0.36) (2022-03-31)

### Bug Fixes

- **deps:** update framework dependencies to ^1.1.0 ([3fe38db](https://github.com/NullVoxPopuli/ember-repl/commit/3fe38db0f73a2574379164cab8dacf077dc1e65f))

## [2.0.35](https://github.com/NullVoxPopuli/ember-repl/compare/v2.0.34...v2.0.35) (2022-03-23)

### Bug Fixes

- **deps:** update dependency ember-auto-import to v2.4.1 ([7ee520f](https://github.com/NullVoxPopuli/ember-repl/commit/7ee520f31b0fdf4aa169e810a87d08d9d8d1f18a))

## [2.0.34](https://github.com/NullVoxPopuli/ember-repl/compare/v2.0.33...v2.0.34) (2022-03-19)

### Bug Fixes

- **deps:** update dependency @babel/standalone to ^7.17.8 ([177e151](https://github.com/NullVoxPopuli/ember-repl/commit/177e1511ce704b3c90a523325a1244c41b67e3f7))

## [2.0.33](https://github.com/NullVoxPopuli/ember-repl/compare/v2.0.32...v2.0.33) (2022-03-14)

### Bug Fixes

- **deps:** update dependency @babel/standalone to ^7.17.7 ([9b7d5ad](https://github.com/NullVoxPopuli/ember-repl/commit/9b7d5ad477ac7779bdc8304205945b030199cf58))

## [2.0.32](https://github.com/NullVoxPopuli/ember-repl/compare/v2.0.31...v2.0.32) (2022-03-08)

### Bug Fixes

- **deps:** update embroider monorepo to ^1.5.0 ([3126e22](https://github.com/NullVoxPopuli/ember-repl/commit/3126e22edc2be2713981e659db95dbdc43f124d7))

## [2.0.31](https://github.com/NullVoxPopuli/ember-repl/compare/v2.0.30...v2.0.31) (2022-03-07)

### Bug Fixes

- **deps:** update embroider monorepo to ^1.4.0 ([7175e9e](https://github.com/NullVoxPopuli/ember-repl/commit/7175e9e4bb1b51d2cb1d994c704e7696321553f6))

## [2.0.30](https://github.com/NullVoxPopuli/ember-repl/compare/v2.0.29...v2.0.30) (2022-03-04)

### Bug Fixes

- **deps:** update embroider monorepo to ^1.3.0 ([2073994](https://github.com/NullVoxPopuli/ember-repl/commit/20739945e01adbd2e1183c0c075d10a0be3a5d76))

## [2.0.29](https://github.com/NullVoxPopuli/ember-repl/compare/v2.0.28...v2.0.29) (2022-02-22)

### Bug Fixes

- **deps:** update dependency @babel/standalone to ^7.17.6 ([bda063a](https://github.com/NullVoxPopuli/ember-repl/commit/bda063a5bf4bf7f89b4f906d2205d6146bebb76e))

## [2.0.28](https://github.com/NullVoxPopuli/ember-repl/compare/v2.0.27...v2.0.28) (2022-02-17)

### Bug Fixes

- **deps:** update dependency @babel/standalone to ^7.17.5 ([335115e](https://github.com/NullVoxPopuli/ember-repl/commit/335115e53ac60e81a3fb6a5fb116b198d854fe25))

## [2.0.27](https://github.com/NullVoxPopuli/ember-repl/compare/v2.0.26...v2.0.27) (2022-02-16)

### Bug Fixes

- **deps:** update dependency @babel/standalone to ^7.17.4 ([8fc30f9](https://github.com/NullVoxPopuli/ember-repl/commit/8fc30f90ae3bc5b6275cfa3653d50dc849b18865))

## [2.0.26](https://github.com/NullVoxPopuli/ember-repl/compare/v2.0.25...v2.0.26) (2022-02-15)

### Bug Fixes

- **deps:** update dependency @babel/standalone to ^7.17.3 ([d7ef131](https://github.com/NullVoxPopuli/ember-repl/commit/d7ef131a5643eca8f03770ca91315911f42b8308))

## [2.0.25](https://github.com/NullVoxPopuli/ember-repl/compare/v2.0.24...v2.0.25) (2022-02-13)

### Bug Fixes

- **types:** update type-dependencies ([91b3d9b](https://github.com/NullVoxPopuli/ember-repl/commit/91b3d9be92ab436aa8fb3227339f72594d3492d0))

## [2.0.24](https://github.com/NullVoxPopuli/ember-repl/compare/v2.0.23...v2.0.24) (2022-02-04)

### Bug Fixes

- **deps:** update dependency ember-cli-typescript to v5 ([8625108](https://github.com/NullVoxPopuli/ember-repl/commit/8625108c5f4aab7362061ab372e3afb9e7a29938))

## [2.0.23](https://github.com/NullVoxPopuli/ember-repl/compare/v2.0.22...v2.0.23) (2022-02-03)

### Bug Fixes

- **deps:** update dependency @babel/standalone to ^7.17.1 ([117113f](https://github.com/NullVoxPopuli/ember-repl/commit/117113f49e663c7e6c97f3c8bc18576cd6cd253a))

## [2.0.22](https://github.com/NullVoxPopuli/ember-repl/compare/v2.0.21...v2.0.22) (2022-02-03)

### Bug Fixes

- **deps:** update dependency @babel/standalone to ^7.17.0 ([c4fe077](https://github.com/NullVoxPopuli/ember-repl/commit/c4fe07719de120ced79a8aba229fc8e62c170e34))

## [2.0.21](https://github.com/NullVoxPopuli/ember-repl/compare/v2.0.20...v2.0.21) (2022-01-22)

### Bug Fixes

- **deps:** update dependency @babel/standalone to ^7.16.12 ([c1d76d2](https://github.com/NullVoxPopuli/ember-repl/commit/c1d76d2def25666b61d76b736335e3e062d7e05b))

## [2.0.20](https://github.com/NullVoxPopuli/ember-repl/compare/v2.0.19...v2.0.20) (2022-01-21)

### Bug Fixes

- **deps:** update dependency ember-auto-import to v2.4.0 ([bf6c7c1](https://github.com/NullVoxPopuli/ember-repl/commit/bf6c7c16a464155e39375bb6de50d4de47cb9242))

## [2.0.19](https://github.com/NullVoxPopuli/ember-repl/compare/v2.0.18...v2.0.19) (2022-01-20)

### Bug Fixes

- **deps:** update dependency @babel/standalone to ^7.16.11 ([1e2c5ad](https://github.com/NullVoxPopuli/ember-repl/commit/1e2c5ad9805b51066768d22db87903696c6d4e3e))

## [2.0.18](https://github.com/NullVoxPopuli/ember-repl/compare/v2.0.17...v2.0.18) (2022-01-19)

### Bug Fixes

- **deps:** update dependency @babel/standalone to ^7.16.10 ([6288619](https://github.com/NullVoxPopuli/ember-repl/commit/62886199d7daf8134033364c204e2a55e6df2c64))

## [2.0.17](https://github.com/NullVoxPopuli/ember-repl/compare/v2.0.16...v2.0.17) (2022-01-19)

### Bug Fixes

- **deps:** update embroider monorepo to v1 ([8328376](https://github.com/NullVoxPopuli/ember-repl/commit/832837662f0fdb11e3a9d2546336c68ded0ecffc))

## [2.0.16](https://github.com/NullVoxPopuli/ember-repl/compare/v2.0.15...v2.0.16) (2022-01-15)

### Bug Fixes

- **deps:** update dependency ember-auto-import to v2.3.0 ([1cbafd6](https://github.com/NullVoxPopuli/ember-repl/commit/1cbafd6b1f7f8d3ef11bd840c613dd999bf30a7e))

## [2.0.15](https://github.com/NullVoxPopuli/ember-repl/compare/v2.0.14...v2.0.15) (2022-01-14)

### Bug Fixes

- **deps:** update embroider monorepo to ^0.50.2 ([e64a649](https://github.com/NullVoxPopuli/ember-repl/commit/e64a64977aef6d075890823dd0b6eb5c26252dfb))

## [2.0.14](https://github.com/NullVoxPopuli/ember-repl/compare/v2.0.13...v2.0.14) (2022-01-13)

### Bug Fixes

- **deps:** update embroider monorepo to ^0.50.1 ([f7fb9c5](https://github.com/NullVoxPopuli/ember-repl/commit/f7fb9c528d3b80282a864c10b7551923bf8af397))

## [2.0.13](https://github.com/NullVoxPopuli/ember-repl/compare/v2.0.12...v2.0.13) (2022-01-12)

### Bug Fixes

- **deps:** update dependency @babel/standalone to ^7.16.9 ([e388182](https://github.com/NullVoxPopuli/ember-repl/commit/e3881829e71055e75e6acce7ba9072b3918718e9))

## [2.0.12](https://github.com/NullVoxPopuli/ember-repl/compare/v2.0.11...v2.0.12) (2022-01-11)

### Bug Fixes

- **deps:** update dependency @babel/standalone to ^7.16.8 ([2fffcd8](https://github.com/NullVoxPopuli/ember-repl/commit/2fffcd8532048fc9f2040eaa99f9b218b277c327))

## [2.0.11](https://github.com/NullVoxPopuli/ember-repl/compare/v2.0.10...v2.0.11) (2022-01-08)

### Bug Fixes

- **deps:** update embroider monorepo to ^0.50.0 ([bc697ef](https://github.com/NullVoxPopuli/ember-repl/commit/bc697ef5831b1c11bbb1caa19d55670dbc0abf06))

## [2.0.10](https://github.com/NullVoxPopuli/ember-repl/compare/v2.0.9...v2.0.10) (2021-12-31)

### Bug Fixes

- **deps:** update dependency @babel/standalone to ^7.16.7 ([76ed36b](https://github.com/NullVoxPopuli/ember-repl/commit/76ed36b89648f2311d88a57d88e188dbb123c51e))

## [2.0.9](https://github.com/NullVoxPopuli/ember-repl/compare/v2.0.8...v2.0.9) (2021-12-22)

### Bug Fixes

- **deps:** update dependency ember-cli-babel to ^7.26.11 ([fb572e5](https://github.com/NullVoxPopuli/ember-repl/commit/fb572e5bd40221286f69182831cab706343362d4))

## [2.0.8](https://github.com/NullVoxPopuli/ember-repl/compare/v2.0.7...v2.0.8) (2021-12-21)

### Bug Fixes

- **deps:** update embroider monorepo to ^0.49.0 ([10890cb](https://github.com/NullVoxPopuli/ember-repl/commit/10890cbcd38287f6f0ace27e64b7c226bfee4add))

## [2.0.7](https://github.com/NullVoxPopuli/ember-repl/compare/v2.0.6...v2.0.7) (2021-12-17)

### Bug Fixes

- **deps:** update dependency ember-cli-babel to ^7.26.10 ([9b490b5](https://github.com/NullVoxPopuli/ember-repl/commit/9b490b539fcd6ba63ec66585764769f53f114633))

## [2.0.6](https://github.com/NullVoxPopuli/ember-repl/compare/v2.0.5...v2.0.6) (2021-12-16)

### Bug Fixes

- **deps:** update dependency ember-cli-babel to ^7.26.8 ([35a7072](https://github.com/NullVoxPopuli/ember-repl/commit/35a70723add81efcbc83218bd7b3a7b45e9e1d37))

## [2.0.5](https://github.com/NullVoxPopuli/ember-repl/compare/v2.0.4...v2.0.5) (2021-12-15)

### Bug Fixes

- **deps:** update dependency @babel/standalone to ^7.16.6 ([0eb5809](https://github.com/NullVoxPopuli/ember-repl/commit/0eb58098ed704c9bcf9da9302f757bbd588e2ed7))

## [2.0.4](https://github.com/NullVoxPopuli/ember-repl/compare/v2.0.3...v2.0.4) (2021-12-14)

### Bug Fixes

- **deps:** update dependency @babel/standalone to ^7.16.5 ([6eb2ee1](https://github.com/NullVoxPopuli/ember-repl/commit/6eb2ee1c9473918c7acee01eabd726a019a71d7b))

## [2.0.3](https://github.com/NullVoxPopuli/ember-repl/compare/v2.0.2...v2.0.3) (2021-12-09)

### Bug Fixes

- **deps:** update embroider monorepo to ^0.48.1 ([0283c44](https://github.com/NullVoxPopuli/ember-repl/commit/0283c44f3c53b793533067df0ffe1e75c330ace8))

## [2.0.2](https://github.com/NullVoxPopuli/ember-repl/compare/v2.0.1...v2.0.2) (2021-12-08)

### Bug Fixes

- **deps:** update embroider monorepo to ^0.48.0 ([f18bfa5](https://github.com/NullVoxPopuli/ember-repl/commit/f18bfa5e707e5849302277fd4f14569866c7779d))

## [2.0.1](https://github.com/NullVoxPopuli/ember-repl/compare/v2.0.0...v2.0.1) (2021-12-05)

### Bug Fixes

- **deps:** update dependency ember-cli-htmlbars to ^6.0.1 ([735c905](https://github.com/NullVoxPopuli/ember-repl/commit/735c905a2f99be48865f6cd7ba7ea3abe9cd860d))

# [2.0.0](https://github.com/NullVoxPopuli/ember-repl/compare/v1.8.10...v2.0.0) (2021-12-04)

### chore

- **internal:** ci updates, drop node 12 ([77637a9](https://github.com/NullVoxPopuli/ember-repl/commit/77637a94c5d30809ceeb4895a21434dfb3bd4d3a))

### BREAKING CHANGES

- **internal:** drop support for node 12
  Add support for Node 16, Ember 3.28

## [1.8.10](https://github.com/NullVoxPopuli/ember-repl/compare/v1.8.9...v1.8.10) (2021-11-19)

### Bug Fixes

- **deps:** update dependency ember-cli-htmlbars to v6 ([353fc09](https://github.com/NullVoxPopuli/ember-repl/commit/353fc09daddbab906b0c3d9fe1c82248e151c53b))

## [1.8.9](https://github.com/NullVoxPopuli/ember-repl/compare/v1.8.8...v1.8.9) (2021-11-19)

### Bug Fixes

- **deps:** update embroider monorepo to ^0.47.2 ([e86e1d3](https://github.com/NullVoxPopuli/ember-repl/commit/e86e1d31d4f54a6a2bb223f4ecfb8eadc3f0244e))

## [1.8.8](https://github.com/NullVoxPopuli/ember-repl/compare/v1.8.7...v1.8.8) (2021-11-19)

### Bug Fixes

- **deps:** update dependency @babel/standalone to ^7.16.4 ([a337cc9](https://github.com/NullVoxPopuli/ember-repl/commit/a337cc99e2dd626161beff2dd5bd615461ea515c))

## [1.8.7](https://github.com/NullVoxPopuli/ember-repl/compare/v1.8.6...v1.8.7) (2021-11-18)

### Bug Fixes

- **deps:** update dependency common-tags to ^1.8.2 ([dbcc82a](https://github.com/NullVoxPopuli/ember-repl/commit/dbcc82ab496d5a64858293dccc9a781aefd3e0e3))

## [1.8.6](https://github.com/NullVoxPopuli/ember-repl/compare/v1.8.5...v1.8.6) (2021-11-18)

### Bug Fixes

- **deps:** update dependency babel-plugin-htmlbars-inline-precompile to ^5.3.1 ([7f24fdc](https://github.com/NullVoxPopuli/ember-repl/commit/7f24fdc248ad9a9435655b9f3638e87aed339a0f))

## [1.8.5](https://github.com/NullVoxPopuli/ember-repl/compare/v1.8.4...v1.8.5) (2021-11-17)

### Bug Fixes

- **deps:** update cli dependencies ([eb6703c](https://github.com/NullVoxPopuli/ember-repl/commit/eb6703c641018a7427c2dfc9b0c7b9ab58f6af13))
- allow to pass call through the included chain ([f47912c](https://github.com/NullVoxPopuli/ember-repl/commit/f47912c577fb326f55f0818b95f47387175570db))
- rollback @semantic/\* packages ([8723f39](https://github.com/NullVoxPopuli/ember-repl/commit/8723f390a88409b20eb040f362da1ef9b5d236c1))
- rollback semantic release -- breaking change was not correctly guarded ([d419c8c](https://github.com/NullVoxPopuli/ember-repl/commit/d419c8c2219384ce84e45224fd8a72af740fc7cd))

## [1.8.4](https://github.com/NullVoxPopuli/ember-repl/compare/v1.8.3...v1.8.4) (2021-09-26)

### Bug Fixes

- **deps:** update embroider monorepo to ^0.44.2 ([07c5082](https://github.com/NullVoxPopuli/ember-repl/commit/07c5082aabf72aede16a007b46e8d2fc27885171))

## [1.8.3](https://github.com/NullVoxPopuli/ember-repl/compare/v1.8.2...v1.8.3) (2021-09-18)

### Bug Fixes

- **deps:** update dependency @babel/standalone to ^7.15.7 ([9a5c72f](https://github.com/NullVoxPopuli/ember-repl/commit/9a5c72f87ffa2bbf93f67ead778b9c52d29c0e94))

## [1.8.2](https://github.com/NullVoxPopuli/ember-repl/compare/v1.8.1...v1.8.2) (2021-09-12)

### Bug Fixes

- **deps:** update embroider monorepo to ^0.44.1 ([54788b9](https://github.com/NullVoxPopuli/ember-repl/commit/54788b92ea63c28aa0f290e90ff6cf55e2a72477))

## [1.8.1](https://github.com/NullVoxPopuli/ember-repl/compare/v1.8.0...v1.8.1) (2021-09-12)

### Bug Fixes

- **deps:** update dependency @babel/standalone to ^7.15.6 ([21da073](https://github.com/NullVoxPopuli/ember-repl/commit/21da0737b9f72595c382629d668f47f9ba06dba7))

# [1.8.0](https://github.com/NullVoxPopuli/ember-repl/compare/v1.7.14...v1.8.0) (2021-09-11)

### Features

- add `buildComponentMap` to index.js to help with tree shaking ([742ef80](https://github.com/NullVoxPopuli/ember-repl/commit/742ef80897c7379b4d726d5ea23e15fbaf583da2))

## [1.7.14](https://github.com/NullVoxPopuli/ember-repl/compare/v1.7.13...v1.7.14) (2021-08-11)

### Bug Fixes

- **deps:** update dependency @babel/standalone to ^7.15.3 ([6bb5cb0](https://github.com/NullVoxPopuli/ember-repl/commit/6bb5cb0941fbe52c166ce4841a720942fef247df))

## [1.7.14](https://github.com/NullVoxPopuli/ember-repl/compare/v1.7.13...v1.7.14) (2021-08-11)

### Bug Fixes

- **deps:** update dependency @babel/standalone to ^7.15.3 ([6bb5cb0](https://github.com/NullVoxPopuli/ember-repl/commit/6bb5cb0941fbe52c166ce4841a720942fef247df))

## [1.7.13](https://github.com/NullVoxPopuli/ember-repl/compare/v1.7.12...v1.7.13) (2021-08-10)

### Bug Fixes

- **deps:** update dependency ember-auto-import to ^2.1.0 ([c278afb](https://github.com/NullVoxPopuli/ember-repl/commit/c278afbe5617ef991e749f91366173553d1a7bf3))

## [1.7.12](https://github.com/NullVoxPopuli/ember-repl/compare/v1.7.11...v1.7.12) (2021-08-10)

### Bug Fixes

- **deps:** update embroider monorepo to ^0.43.5 ([c536aff](https://github.com/NullVoxPopuli/ember-repl/commit/c536affbc4826979ff314f858432fcb26bf4b243))

## [1.7.11](https://github.com/NullVoxPopuli/ember-repl/compare/v1.7.10...v1.7.11) (2021-08-09)

### Bug Fixes

- **deps:** update dependency ember-compatibility-helpers to ^1.2.5 ([0683999](https://github.com/NullVoxPopuli/ember-repl/commit/068399954dac4d79eb0d72854a4da1f9e8a7080e))

## [1.7.10](https://github.com/NullVoxPopuli/ember-repl/compare/v1.7.9...v1.7.10) (2021-08-08)

### Bug Fixes

- **deps:** update dependency @babel/standalone to ^7.15.2 ([a588aa3](https://github.com/NullVoxPopuli/ember-repl/commit/a588aa3c0481705705c1326c068e55e6f4fd2e2f))

## [1.7.9](https://github.com/NullVoxPopuli/ember-repl/compare/v1.7.8...v1.7.9) (2021-08-05)

### Bug Fixes

- **deps:** update dependency @babel/standalone to ^7.15.1 ([5129c2c](https://github.com/NullVoxPopuli/ember-repl/commit/5129c2c20fa1fc67804b10441fa9a5f9cfe12e64))

## [1.7.8](https://github.com/NullVoxPopuli/ember-repl/compare/v1.7.7...v1.7.8) (2021-08-04)

### Bug Fixes

- **deps:** update dependency @babel/standalone to ^7.15.0 ([0971e5d](https://github.com/NullVoxPopuli/ember-repl/commit/0971e5de5ac43694d63fb9451f9dcfcc2c4b8aac))

## [1.7.7](https://github.com/NullVoxPopuli/ember-repl/compare/v1.7.6...v1.7.7) (2021-08-03)

### Bug Fixes

- **deps:** update embroider monorepo to ^0.43.4 ([ffd05da](https://github.com/NullVoxPopuli/ember-repl/commit/ffd05da5e700f90e05ae5c7a4b4dd1d3c94109a9))

## [1.7.6](https://github.com/NullVoxPopuli/ember-repl/compare/v1.7.5...v1.7.6) (2021-08-01)

### Bug Fixes

- **deps:** update dependency @babel/standalone to ^7.14.9 ([f39bf67](https://github.com/NullVoxPopuli/ember-repl/commit/f39bf673510645049e5a62b392c4d9fb54f37022))

## [1.7.5](https://github.com/NullVoxPopuli/ember-repl/compare/v1.7.4...v1.7.5) (2021-07-31)

### Bug Fixes

- **deps:** update embroider monorepo to ^0.43.3 ([2ef8bcd](https://github.com/NullVoxPopuli/ember-repl/commit/2ef8bcd0f9726b4d1e8f6a5dd4797a36970205a9))

## [1.7.4](https://github.com/NullVoxPopuli/ember-repl/compare/v1.7.3...v1.7.4) (2021-07-30)

### Bug Fixes

- **deps:** update embroider monorepo to ^0.43.2 ([b9ea925](https://github.com/NullVoxPopuli/ember-repl/commit/b9ea925ead339ba3c13d1e37eeca10ba1cc6305c))

## [1.7.3](https://github.com/NullVoxPopuli/ember-repl/compare/v1.7.2...v1.7.3) (2021-07-30)

### Bug Fixes

- **deps:** update dependency @babel/standalone to ^7.14.8 ([23a246c](https://github.com/NullVoxPopuli/ember-repl/commit/23a246c6d24b5f53bedd12f07ca6049a81dab40c))

## [1.7.2](https://github.com/NullVoxPopuli/ember-repl/compare/v1.7.1...v1.7.2) (2021-07-29)

### Bug Fixes

- **deps:** update embroider monorepo to ^0.43.1 ([c9bd2e3](https://github.com/NullVoxPopuli/ember-repl/commit/c9bd2e3eaaf3a727311d2da5efea0af4b4d379ed))
- **package:** set a description ([062295d](https://github.com/NullVoxPopuli/ember-repl/commit/062295dbdcb396fdad207ed3b340ef9e78b178dd))

## [1.7.1](https://github.com/NullVoxPopuli/ember-repl/compare/v1.7.0...v1.7.1) (2021-07-12)

### Bug Fixes

- **types:** use ec-ts' generated types instead of declarations file ([ec11711](https://github.com/NullVoxPopuli/ember-repl/commit/ec11711d05c84575998c84d82eca7d536d5c7393))

# [1.7.0](https://github.com/NullVoxPopuli/ember-repl/compare/v1.6.2...v1.7.0) (2021-07-12)

### Features

- **js:** support passing extra modules to compileJS ([2356720](https://github.com/NullVoxPopuli/ember-repl/commit/23567208bef0a37ec60758b80722d5d6d0a942ef))

## [1.6.2](https://github.com/NullVoxPopuli/ember-repl/compare/v1.6.1...v1.6.2) (2021-07-12)

### Bug Fixes

- **embroider:** allow local helpers, the hacky way ([877502d](https://github.com/NullVoxPopuli/ember-repl/commit/877502db8955951e45e670e34691a01cf09f675b))

## [1.6.1](https://github.com/NullVoxPopuli/ember-repl/compare/v1.6.0...v1.6.1) (2021-07-10)

### Bug Fixes

- **js:** combine preconfigured required with window ([9483e89](https://github.com/NullVoxPopuli/ember-repl/commit/9483e89bb189b11e9800ad1dcf4bce382b3dacd5))

# [1.6.0](https://github.com/NullVoxPopuli/ember-repl/compare/v1.5.0...v1.6.0) (2021-07-10)

### Features

- **js:** use window.require during eval ([1249d11](https://github.com/NullVoxPopuli/ember-repl/commit/1249d1108f645d7bfb3ab71964aaf01b9b3d5e01))

# [1.5.0](https://github.com/NullVoxPopuli/ember-repl/compare/v1.4.1...v1.5.0) (2021-07-08)

### Features

- **js:** await import babel to protect initial load ([28c3c21](https://github.com/NullVoxPopuli/ember-repl/commit/28c3c215f9827358df5c98c0fbffd7cb7abdecb5))

## [1.4.1](https://github.com/NullVoxPopuli/ember-repl/compare/v1.4.0...v1.4.1) (2021-07-06)

### Bug Fixes

- **utils:** add missing export ([aa897ad](https://github.com/NullVoxPopuli/ember-repl/commit/aa897ada98e45f2256e1e815555903e672ab9c31))

# [1.4.0](https://github.com/NullVoxPopuli/ember-repl/compare/v1.3.1...v1.4.0) (2021-07-06)

### Features

- **utils:** add invocationName ([645e27d](https://github.com/NullVoxPopuli/ember-repl/commit/645e27d9a58358808ef1ca37c2814d377cd675d9))

## [1.3.1](https://github.com/NullVoxPopuli/ember-repl/compare/v1.3.0...v1.3.1) (2021-07-06)

### Bug Fixes

- **types:** public types had mismatch with published types ([7ce4204](https://github.com/NullVoxPopuli/ember-repl/commit/7ce4204a4f6fd1ff8e11aeab41c7f27130e7be6e))

# [1.3.0](https://github.com/NullVoxPopuli/ember-repl/compare/v1.2.0...v1.3.0) (2021-07-06)

### Features

- **hbs:** switch away from eval in favor of @glimmer/compiler direct ([7900e73](https://github.com/NullVoxPopuli/ember-repl/commit/7900e7301e3cbe82dc6a58f534979b3c98ac2c4c))
- **types:** add CompileResult type to public API ([6e6dcef](https://github.com/NullVoxPopuli/ember-repl/commit/6e6dcef79fbc2749af6be0a685cdfc5c0a08efb6))

# [1.2.0](https://github.com/NullVoxPopuli/ember-repl/compare/v1.1.0...v1.2.0) (2021-07-06)

### Features

- **hbs, scope:** Merge pull request [#29](https://github.com/NullVoxPopuli/ember-repl/issues/29) from NullVoxPopuli/support-scope-for-hbs ([611f699](https://github.com/NullVoxPopuli/ember-repl/commit/611f699ef8953be9220c5b94e41170224deec6e6))

# [1.1.0](https://github.com/NullVoxPopuli/ember-repl/compare/v1.0.3...v1.1.0) (2021-07-05)

### Features

- **npm:** rename to ember-repl as ember-play is taken ([46235a4](https://github.com/NullVoxPopuli/ember-repl/commit/46235a418b9adc57ff99f02d14f68e8553385bb5))

## [1.0.3](https://github.com/NullVoxPopuli/ember-repl/compare/v1.0.2...v1.0.3) (2021-07-05)

### Bug Fixes

- **deps:** update dependency @babel/standalone to ^7.14.7 ([44e3dff](https://github.com/NullVoxPopuli/ember-repl/commit/44e3dff3d20aa7515ae4932013b6aadf91164df9))

## [1.0.2](https://github.com/NullVoxPopuli/ember-repl/compare/v1.0.1...v1.0.2) (2021-07-05)

### Bug Fixes

- **ts:** add deps until TS is happy ([24ebf32](https://github.com/NullVoxPopuli/ember-repl/commit/24ebf3233253c1020a67072e1ef98526137579f0))

## [1.0.1](https://github.com/NullVoxPopuli/ember-repl/compare/v1.0.0...v1.0.1) (2021-07-04)

### Bug Fixes

- **release:** trigger release ([9ea944c](https://github.com/NullVoxPopuli/ember-repl/commit/9ea944c2a8c5f01358d4a142777bb89112d07616))

# 1.0.0 (2021-07-04)

### Features

- **js:** compileJS now works ([cf4730c](https://github.com/NullVoxPopuli/ember-repl/commit/cf4730cb50853b1e38fc293b3e3bd5fdf619e06e))
