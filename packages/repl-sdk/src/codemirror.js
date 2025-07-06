import { completionKeymap } from '@codemirror/autocomplete';
import { indentWithTab } from '@codemirror/commands';
import { markdownKeymap } from '@codemirror/lang-markdown';
import { Compartment, EditorSelection, EditorState } from '@codemirror/state';
import { keymap } from '@codemirror/view';
import { basicSetup, EditorView } from 'codemirror';
// @ts-ignore
import { foldByIndent } from 'codemirror-lang-mermaid';

/**
 * Builds and creates a codemirror instance for the given element
 */
export async function buildCodemirror({
  element,
  text,
  format,
  extensions,
  handleUpdate,
  getLang,
  getSupport,
}) {
  let languageConf = new Compartment();
  let tabSize = new Compartment();

  let updateListener = EditorView.updateListener.of(({ state, docChanged }) => {
    if (docChanged) {
      handleUpdate(state.doc.toString());
    }
  });

  async function languageForFormat(format) {
    switch (format) {
      case 'glimdown':
      case 'gdm':
      case 'gmd':
        return getLang('gmd');
      case 'jsx':
      case 'jsx|react':
        return getLang('jsx|react');
      default:
        return getLang(format);
    }
  }

  async function supportForFormat(format) {
    let support = getSupport(format);

    if (!support) {
      return [];
    }

    return Array.isArray(support) ? support : [support];
  }

  const [language, support] = await Promise.all([
    languageForFormat(format),
    supportForFormat(format),
  ]);

  let view = new EditorView({
    parent: element,
    state: EditorState.create({
      // doc: value,
      extensions: [
        // features
        basicSetup,
        foldByIndent(),
        // Language
        language,
        ...support,

        updateListener,
        EditorView.lineWrapping,
        keymap.of([
          // Intentionally do not capture the tab key -- otherwise we can't leave the editor.
          indentWithTab,
          ...completionKeymap,
          ...markdownKeymap,
        ]),

        // TODO: lsp,

        ...(extensions ?? []),
      ],
    }),
  });

  let setText = async (text, format) => {
    view.dispatch({
      changes: {
        from: 0,
        to: view.state.doc.length,
        insert: text,
      },
      effects: languageConf.reconfigure(await languageForFormat(format)),
    });
  };

  view.dispatch(
    view.state.changeByRange((range) => ({
      changes: [{ from: range.from, insert: text }],
      range: EditorSelection.range(range.from, range.to),
    }))
  );

  view.dispatch({
    effects: [
      tabSize.reconfigure(EditorState.tabSize.of(2)),
      // languageConf.reconfigure(languageForFormat(format)),
    ],
  });

  return { view, setText };
}
