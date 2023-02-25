import { completionKeymap } from '@codemirror/autocomplete';
import { javascript } from '@codemirror/lang-javascript';
import { markdownKeymap } from '@codemirror/lang-markdown';
import { syntaxHighlighting } from '@codemirror/language';
import { Compartment, EditorSelection, EditorState } from '@codemirror/state';
import { keymap } from '@codemirror/view';
import { basicSetup, EditorView } from 'codemirror';

import { glimdown } from './glimdown';
import { HorizonSyntaxTheme } from './horizon-syntax-theme';
import { HorizonTheme } from './horizon-ui-theme';

export default function newEditor(
  element: HTMLElement,
  value: string,
  format: 'glimdown' | 'gjs' | 'hbs',
  updateText: (text: string) => void
) {
  let languageConf = new Compartment();
  let tabSize = new Compartment();

  let updateListener = EditorView.updateListener.of(({ state, docChanged }) => {
    if (docChanged) {
      updateText(state.doc.toString());
    }
  });

  function languageForFormat(format: 'glimdown' | 'gjs' | 'hbs') {
    switch (format) {
      case 'glimdown':
        return glimdown();
      case 'gjs': {
        // Includes autocomplete, which is annoying since we're 
        // kind of writing invalid JavaScript
        return javascript({ jsx: true });
        // return new LanguageSupport(typescriptLanguage, [])
      }
      case 'hbs':
        return javascript();
      default:
        throw new Error(`Unrecognized format: ${format}`);
    }
  }

  let view = new EditorView({
    parent: element,
    extensions: [
      // features
      basicSetup,
      languageForFormat(format),
      updateListener,
      EditorView.lineWrapping,
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      keymap.of([
        // Intentionally do not capture the tab key -- otherwise we can't leave the editor.
        // indentWithTab
        ...completionKeymap,
        ...markdownKeymap,
      ]),

      // lsp,

      // Theme
      HorizonTheme,
      syntaxHighlighting(HorizonSyntaxTheme),
    ],
  });

  let setText = (text: string, format: 'glimdown' | 'gjs' | 'hbs') => {
    view.dispatch({
      changes: {
        from: 0,
        to: view.state.doc.length,
        insert: text,
      },
      effects: languageConf.reconfigure(languageForFormat(format)),
    });
  };

  view.dispatch(
    view.state.changeByRange((range) => ({
      changes: [{ from: range.from, insert: value }],
      range: EditorSelection.range(range.from, range.to),
    }))
  );

  view.dispatch({
    effects: [
      tabSize.reconfigure(EditorState.tabSize.of(2)),
      languageConf.reconfigure(languageForFormat(format)),
    ],
  });

  return { view, setText };
}
