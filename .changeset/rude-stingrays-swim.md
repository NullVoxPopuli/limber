---
"limber-snippet": major
---

Initial release of limber-snippet.

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
