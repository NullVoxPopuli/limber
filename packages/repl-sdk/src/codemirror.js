import { completionKeymap } from '@codemirror/autocomplete';
import { indentWithTab } from '@codemirror/commands';
import { markdownKeymap } from '@codemirror/lang-markdown';
import { Compartment, EditorSelection, EditorState } from '@codemirror/state';
import { keymap } from '@codemirror/view';
import { basicSetup, EditorView } from 'codemirror';
// @ts-ignore
import { foldByIndent } from 'codemirror-lang-mermaid';
import shiki from 'codemirror-shiki';
import { createHighlighterCore } from 'shiki/core';
import { createOnigurumaEngine } from 'shiki/engine/oniguruma';

/**
 * Builds and creates a codemirror instance for the given element
 *
 * @typedef {any} Extension
 *
 * @typedef {object} CodemirrorOptions
 * @property {HTMLElement} element
 * @property {string} text
 * @property {string} format
 * @property {Extension[]} [ extensions ]
 * @property {(text: string) => void} handleUpdate
 * @property {(format: string) => Promise<Extension>} getLang
 * @property {(format: string) => Promise<Extension>} getSupport
 *
 * @param {CodemirrorOptions} options
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
  const languageConf = new Compartment();
  const supportConf = new Compartment();
  const tabSize = new Compartment();

  const updateListener = EditorView.updateListener.of(({ state, docChanged }) => {
    if (docChanged) {
      handleUpdate(state.doc.toString());
    }
  });

  /**
   * @param {string} format
   */
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

  /**
   * @param {string} format
   */
  async function supportForFormat(format) {
    const support = await getSupport(format);

    if (!support) {
      return [];
    }

    return Array.isArray(support) ? support : [support];
  }

  const [language, support] = await Promise.all([
    languageForFormat(format),
    supportForFormat(format),
  ]);

  const highlighter = createHighlighterCore({
    langs: [
      import('@shikijs/langs/javascript'),
      import('@shikijs/langs/typescript'),
      import('@shikijs/langs/glimmer-js'),
      import('@shikijs/langs/glimmer-ts'),
    ],
    themes: [import('@shikijs/themes/one-dark-pro')],
    engine: createOnigurumaEngine(import('shiki/wasm')),
  });

  const editorExtensions = [
    // features
    basicSetup,
    foldByIndent(),
    // Language
    // languageConf.of(language),
    supportConf.of(support),

    updateListener,
    EditorView.lineWrapping,
    keymap.of([indentWithTab, ...completionKeymap, ...markdownKeymap]),

    shiki({
      highlighter,
      language: 'glimmer-js',
      theme: 'one-dark-pro',
    }),

    // TODO: lsp,

    ...(extensions ?? []),
  ].filter(Boolean);

  const view = new EditorView({
    parent: element,
    state: EditorState.create({
      extensions: editorExtensions,
    }),
  });

  /**
   * Called from the host app to update the editor.
   *
   * @param {string} text
   * @param {string} format
   */
  const setText = async (text, format) => {
    const [language, support] = await Promise.all([
      languageForFormat(format),
      supportForFormat(format),
    ]);

    console.debug(`Codemirror changing to ${format}: ${language ? 'ok' : 'not ok'}`);

    view.dispatch({
      changes: {
        from: 0,
        to: view.state.doc.length,
        insert: text,
      },
      effects: [languageConf.reconfigure(language), supportConf.reconfigure(support)],
    });
  };

  /**
   * Changes just the format of the editor.
   *
   * @param {string} format
   */
  const setFormat = async (format) => {
    const [language, support] = await Promise.all([
      languageForFormat(format),
      supportForFormat(format),
    ]);

    console.debug(`Codemirror changing to ${format}: ${language ? 'ok' : 'not ok'}`);

    view.dispatch({
      effects: [languageConf.reconfigure(language), supportConf.reconfigure(support)],
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

  return { view, setText, setFormat };
}
