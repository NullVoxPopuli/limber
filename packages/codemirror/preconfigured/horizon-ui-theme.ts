import { EditorView } from '@codemirror/view';
import { syntax, ui } from '@nullvoxpopuli/horizon-theme';

export const HorizonTheme = EditorView.theme(
  {
    '&': {
      color: ui.lightText,
      backgroundColor: ui.background,
      height: '100%',
    },

    '.cm-content': {
      caretColor: ui.secondaryAccent,
      // fontFamily: `'Source Code Pro', ui-monospace, monospace, sans-serif`,
      fontFamily: 'inherit',
      fontWeight: 'normal',
      fontSize: '16px',
      fontFeatureSettings: `"liga" 0, "calt" 0`,
      lineHeight: '24px',
      letterSpacing: '0px',
    },

    '.cm-scroller': {
      fontFamily: 'inherit',
    },

    '&.cm-focused .cm-cursor': { borderLeftColor: ui.lightText },
    '&.cm-focused .cm-selectionBackground, .cm-selectionBackground, ::selection': {
      backgroundColor: ui.backgroundAlt,
    },

    '.cm-panels': { backgroundColor: ui.shadow, color: syntax.gray },
    '.cm-panels.cm-panels-top': { borderBottom: '2px solid black' },
    '.cm-panels.cm-panels-bottom': { borderTop: '2px solid black' },

    '.cm-searchMatch': {
      backgroundColor: '#72a1ff59',
      outline: '1px solid #457dff',
    },
    '.cm-searchMatch.cm-searchMatch-selected': {
      backgroundColor: '#6199ff2f',
    },

    '.cm-activeLine, .cm-activeLineGutter': { backgroundColor: '#2c2c33' },
    '.cm-selectionMatch': { backgroundColor: ui.shadow },

    '.cm-matchingBracket, .cm-nonmatchingBracket': {
      outline: `1px solid ${syntax.lavender}`,
      margin: '-2px',
      padding: '2px',
    },

    '.cm-gutters': {
      backgroundColor: ui.background,
      color: '#777',
      border: 'none',
    },

    '.cm-foldPlaceholder': {
      backgroundColor: 'transparent',
      border: 'none',
      color: '#ddd',
    },

    '.cm-tooltip': {
      border: `1px solid ${ui.border}`,
      backgroundColor: ui.backgroundAlt,
    },
    '.cm-tooltip-autocomplete': {
      '& > ul > li[aria-selected]': {
        backgroundColor: ui.shadow,
        color: ui.accent,
      },
    },
  },

  { dark: true }
);
