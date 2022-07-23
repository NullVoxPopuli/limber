import {
  // completeFromList,
  completionKeymap,
} from '@codemirror/autocomplete';
// import { esLint, javascriptLanguage } from '@codemirror/lang-javascript';
import { syntaxHighlighting } from '@codemirror/language';
// import { linter, lintGutter, lintKeymap } from '@codemirror/lint';
import { Compartment, EditorSelection, EditorState } from '@codemirror/state';
import { keymap } from '@codemirror/view';
import { basicSetup, EditorView } from 'codemirror';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
// import { Linter } from 'eslint4b';
import { glimdown } from './glimdown';
// import { languageServer } from 'codemirror-languageserver';
import { HorizonSyntaxTheme } from './horizon-syntax-theme';
import { HorizonTheme } from './horizon-ui-theme';

export default function newEditor(
  element: HTMLElement,
  value: string,
  updateText: (text: string) => void
) {
  let updateListener = EditorView.updateListener.of(({ state, docChanged }) => {
    if (docChanged) {
      updateText(state.doc.toString());
    }
  });

  // const transport = new WebSocketTransport(serverUri);

  // let serverUri = `${window.location.protocol.endsWith('s:') ? 'wss:' : 'ws:'}//${
  //   window.location.host
  // }`;
  // let filename = 'file.ts';
  // let lsp = languageServer({
  //   // WebSocket server uri and other client options.
  //   serverUri,
  //   rootUri: 'file:///',
  //   documentUri: `file:///${filename}`,
  //   // As defined at https://microsoft.github.io/language-server-protocol/specification#textDocumentItem.
  //   languageId: 'typescript',
  // });

  let view = new EditorView({
    parent: element,
    extensions: [
      // features
      basicSetup,
      updateListener,
      EditorView.lineWrapping,
      keymap.of([
        // Intentionally do not capture the tab key -- otherwise we can't leave the editor.
        // indentWithTab
        // ...defaultKeymap,
        // ...lintKeymap,
        ...completionKeymap,
      ]),

      // languages
      ...glimdown,
      // lintGutter(),
      // linter(esLint(new Linter())),
      // lsp,
      // Theme
      HorizonTheme,
      syntaxHighlighting(HorizonSyntaxTheme),
    ],
  });

  view.dispatch(
    view.state.changeByRange((range) => ({
      changes: [{ from: range.from, insert: value }],
      range: EditorSelection.range(range.from, range.to),
    }))
  );

  let tabSize = new Compartment();

  view.dispatch({
    effects: tabSize.reconfigure(EditorState.tabSize.of(2)),
  });

  let setText = (text: string) => {
    view.dispatch(
      view.state.changeByRange((range) => ({
        changes: [{ from: range.from, insert: text }],
        range: EditorSelection.range(range.from, range.to),
      }))
    );
  };

  return { view, setText };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
// function completionsOfObject(obj: any) {
//   return Object.keys(obj).map((p) => ({
//     label: p,
//     type: /^[A-Z]/.test(p) ? 'class' : typeof obj[p] == 'function' ? 'function' : 'variable',
//   }));
// }
