# CodeMirror Glimmer

This is a CodeMirror 6 plugin that adds support for Glimmer (gjs and gts).

### Usage

```typescript
import { EditorState } from '@codemirror/state';
import { EditorView } from '@codemirror/view';
import { glimmer } from 'tbd';
import { basicSetup } from 'codemirror';

new EditorView({
  state: EditorState.create({
    doc: `<script>let a = "hello world";</script> <div>{a}</div>`,
    extensions: [basicSetup, glimmer()],
  }),
  parent: document.querySelector('#editor'),
});
```
