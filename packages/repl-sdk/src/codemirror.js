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
 *
 * @typedef {any} Extension
 *
 * @typedef {object} LspOptions
 * @property {string} [serverUri]
 * @property {any} [transport]
 * @property {any} [client]
 * @property {string} documentUri
 * @property {string} languageId
 * @property {string | null} [rootUri]
 * @property {unknown[] | null} [workspaceFolders]
 * @property {boolean} [allowHTMLContent]
 * @property {any} [synchronizationMethod]
 * @property {unknown} [initializationOptions]
 *
 * @typedef {object} CodemirrorOptions
 * @property {HTMLElement} element
 * @property {string} text
 * @property {string} format
 * @property {Extension[]} [ extensions ]
 * @property {(text: string) => void} handleUpdate
 * @property {(format: string) => Promise<Extension>} getLang
 * @property {(format: string) => Promise<Extension>} getSupport
 * @property {(format: string) => Promise<false | null | undefined | LspOptions>} [getLsp]
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
  getLsp,
}) {
  const languageConf = new Compartment();
  const supportConf = new Compartment();
  const tabSize = new Compartment();
   const lspConf = new Compartment();

   /** @type {import('codemirror-languageserver').LanguageServerClient | null} */
   let lspClient = null;
   /** @type {string | null} */
   let lspDocumentUri = null;

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

  /**
   * Loads LSP extensions for the given format if configured.
   * Returns an array of extensions (possibly empty).
   *
   * @param {string} format
   * @returns {Promise<import('@codemirror/state').Extension[]>}
   */
  async function lspForFormat(format) {
    if (!getLsp) return [];

    const config = await getLsp(format);

    if (!config) {
      lspClient = null;
      lspDocumentUri = null;

      return [];
    }

    const { LanguageServerClient, languageServerWithTransport } = await import(
      'codemirror-languageserver'
    );

    // @ts-ignore - types for @open-rpc/client-js may not be present in all consumers
    const { WebSocketTransport } = await import('@open-rpc/client-js');

    const transport =
      config.transport ?? (config.serverUri ? new WebSocketTransport(config.serverUri) : undefined);

    if (!transport) {
      console.warn('[cm-lsp] Missing transport (or serverUri) for LSP config. Skipping LSP.');
      lspClient = null;
      lspDocumentUri = null;

      return [];
    }

    const client =
      config.client ??
      new LanguageServerClient({
        transport,
        rootUri: config.rootUri ?? null,
        workspaceFolders: /** @type {any} */ (config.workspaceFolders ?? null),
        documentUri: config.documentUri,
        languageId: config.languageId,
        initializationOptions: config.initializationOptions,
        autoClose: true,
      });

    lspClient = client;
    lspDocumentUri = config.documentUri;

    return languageServerWithTransport({
      transport,
      client,
      documentUri: config.documentUri,
      languageId: config.languageId,
      allowHTMLContent: config.allowHTMLContent,
      synchronizationMethod: config.synchronizationMethod,
      rootUri: config.rootUri ?? null,
      workspaceFolders: /** @type {any} */ (config.workspaceFolders ?? null),
    });
  }

  const lspExtensions = await lspForFormat(format);

  const editorExtensions = [
    // features
    basicSetup,
    foldByIndent(),
    // Language
    languageConf.of(language),
    supportConf.of(support),
    lspConf.of(lspExtensions),

    updateListener,
    EditorView.lineWrapping,
    keymap.of([indentWithTab, ...completionKeymap, ...markdownKeymap]),

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
    const [language, support, lsp] = await Promise.all([
      languageForFormat(format),
      supportForFormat(format),
      lspForFormat(format),
    ]);

    console.debug(`Codemirror changing to ${format}: ${language ? 'ok' : 'not ok'}`);

    view.dispatch({
      changes: {
        from: 0,
        to: view.state.doc.length,
        insert: text,
      },
      effects: [
        languageConf.reconfigure(language),
        supportConf.reconfigure(support),
        lspConf.reconfigure(lsp ?? []),
      ],
    });
  };

  /**
   * Changes just the format of the editor.
   *
   * @param {string} format
   */
  const setFormat = async (format) => {
    const [language, support, lsp] = await Promise.all([
      languageForFormat(format),
      supportForFormat(format),
      lspForFormat(format),
    ]);

    console.debug(`Codemirror changing to ${format}: ${language ? 'ok' : 'not ok'}`);

    view.dispatch({
      effects: [
        languageConf.reconfigure(language),
        supportConf.reconfigure(support),
        lspConf.reconfigure(lsp ?? []),
      ],
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

  /**
   * Formats the editor content using LSP (if available) or Prettier.
   * Uses the current format from the editor state.
   *
   * @returns {Promise<void>}
   */
  const formatCode = async () => {
    const applyTextEdits = (edits) => {
      if (!edits || edits.length === 0) return null;

      const changes = edits
        .map((edit) => {
          const startLine = view.state.doc.line(edit.range.start.line + 1);
          const endLine = view.state.doc.line(edit.range.end.line + 1);

          return {
            from: startLine.from + edit.range.start.character,
            to: endLine.from + edit.range.end.character,
            insert: edit.newText,
          };
        })
        .sort((a, b) => b.from - a.from);

      view.dispatch({ changes });

      return view.state.doc.toString();
    };

    // Prefer LSP formatting when available
    try {
      if (lspClient && lspDocumentUri) {
        const edits = await /** @type {any} */ (lspClient).request(
          'textDocument/formatting',
          {
            textDocument: { uri: lspDocumentUri },
            options: { tabSize: 2, insertSpaces: true },
          },
          10000
        );

        const lspFormatted = applyTextEdits(edits);

        if (lspFormatted != null) {
          handleUpdate(lspFormatted);

          return;
        }
      }
    } catch (error) {
      console.warn('LSP formatting failed, falling back to Prettier.', error);
    }

    // Fallback to Prettier
    try {
      const prettier = await import('prettier');
      const currentText = view.state.doc.toString();

      // Get current format from the element's data-format attribute
      const currentFormat = element.getAttribute('data-format') || format;

      // Determine parser based on format
      let parserName = currentFormat;
      if (currentFormat === 'hbs' || currentFormat === 'hbs|ember') {
        parserName = 'glimmer';
      } else if (currentFormat === 'jsx' || currentFormat === 'jsx|react') {
        parserName = 'babel';
      } else if (currentFormat === 'tsx') {
        parserName = 'typescript';
      } else if (currentFormat === 'gts') {
        parserName = 'typescript';
      } else if (currentFormat === 'gjs') {
        parserName = 'babel';
      }

      const formatted = await prettier.format(currentText, {
        parser: parserName,
        plugins: [],
      });

      view.dispatch({
        changes: {
          from: 0,
          to: view.state.doc.length,
          insert: formatted,
        },
      });

      handleUpdate(formatted);
    } catch (error) {
      console.error('Failed to format with Prettier:', error);
      throw error;
    }
  };

  return { view, setText, setFormat, format: formatCode };
}
