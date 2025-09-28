# limber-ui

## 1.0.0

### Major Changes

- [#586](https://github.com/NullVoxPopuli/limber/pull/586) [`fe81fc7`](https://github.com/NullVoxPopuli/limber/commit/fe81fc79130065ca28dd105b48107d2bd4675d84) Thanks [@NullVoxPopuli](https://github.com/NullVoxPopuli)! - Initial release of limber-snippet.

  Provides a component for iframe-embedding editable code in documentation.

  Examples:

  ```hbs
  <Code @path="templates-how-to/iterate/code/index.gjs" />
  <Code
    @path="templates-how-to/iterate/code/index.gjs"
    @title="Example iteration"
  />

  <Code @code="gjs file content here" @format="gjs" />
  <Code @code="gjs file content here" @format="gjs" />
  ```

  The `Code` component is aliased as `EditableCode` and `REPL` if those names fit your application better.

  ```js
  import { Code, EditableCode, REPL } from "limber-snippet";
  ```

## 1.0.0-beta.0

### Major Changes

- [#586](https://github.com/NullVoxPopuli/limber/pull/586) [`fe81fc79`](https://github.com/NullVoxPopuli/limber/commit/fe81fc79130065ca28dd105b48107d2bd4675d84) Thanks [@NullVoxPopuli](https://github.com/NullVoxPopuli)! - Initial release of limber-snippet.

  Provides a component for iframe-embedding editable code in documentation.

  Examples:

  ```hbs
  <Code @path="templates-how-to/iterate/code/index.gjs" />
  <Code
    @path="templates-how-to/iterate/code/index.gjs"
    @title="Example iteration"
  />

  <Code @code="gjs file content here" @format="gjs" />
  <Code @code="gjs file content here" @format="gjs" />
  ```

  The `Code` component is aliased as `EditableCode` and `REPL` if those names fit your application better.

  ```js
  import { Code, EditableCode, REPL } from "limber-snippet";
  ```
