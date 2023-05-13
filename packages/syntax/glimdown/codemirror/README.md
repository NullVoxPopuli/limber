# CodeMirror Glimdown

This is a CodeMirror 6 plugin that adds support for Glimdown (markdown with glimmer and glimmer-js embedded support).

### Usage

```typescript
import { EditorState } from '@codemirror/state';
import { EditorView } from '@codemirror/view';
import { glimdown } from 'codemirror-lang-glimdown';
import { basicSetup } from 'codemirror';

new EditorView({
  state: EditorState.create({
    doc: `<script>let a = "hello world";</script> <div>{a}</div>`,
    extensions: [basicSetup, glimdown()],
  }),
  parent: document.querySelector('#editor'),
});
```
