import { HighlightStyle } from '@codemirror/language';
import { EditorView } from '@codemirror/view';
import { tags as t } from '@lezer/highlight';

import { alpha, syntax, ui } from '@nullvoxpopuli/horizon-theme';

export const HorizonSyntaxTheme = HighlightStyle.define([
  { tag: [t.meta, t.comment], color: `${syntax.gray}${alpha.medLow}` },
  { tag: t.number, color: `${syntax.apricot}${alpha.high}` },
  { tag: t.string, color: `${syntax.rosebud}${alpha.high}` },
  { tag: t.regexp, color: `${syntax.apricot}${alpha.high}` },
  { tag: t.constant(t.name), color: `${syntax.apricot}${alpha.high}` },
  { tag: t.keyword, color: `${syntax.lavender}${alpha.high}`, fontStyle: 'italic' },
  { tag: t.link, textDecoration: 'underline' },
  { tag: t.strong, fontWeight: 'bold' },
  { tag: t.emphasis, fontStyle: 'italic' },
  { tag: t.heading, color: `${syntax.lavender}${alpha.high}`, fontWeight: 'bold' },
  { tag: t.definition(t.name), color: `${syntax.cranberry}${alpha.high}` },
  { tag: t.className, color: `${syntax.cranberry}${alpha.high}` },
  { tag: t.typeName, color: `${syntax.cranberry}${alpha.high}` },
  { tag: t.propertyName, color: `${syntax.apricot}${alpha.high}`, fontStyle: 'italic' },
  { tag: t.function(t.variableName), color: `${syntax.turquoise}${alpha.high}` },
  { tag: t.labelName, color: `${syntax.rosebud}${alpha.high}` },
  { tag: t.self, color: `${syntax.cranberry}${alpha.high}` },
  { tag: t.namespace, color: `${syntax.cranberry}${alpha.high}` },
  { tag: t.separator, color: `${syntax.gray}${alpha.medLow}` },
  { tag: t.changed, color: syntax.tacao },
  { tag: t.annotation, color: syntax.gray },
  { tag: t.operator, color: `${syntax.apricot}${alpha.high}` },
  { tag: t.operatorKeyword, color: `${syntax.apricot}${alpha.high}` },
  { tag: t.special(t.string), color: syntax.turquoise },
  { tag: t.processingInstruction, color: syntax.rosebud },

  { tag: [t.name, t.character, t.macroName], color: syntax.lavender },
  { tag: t.deleted, color: ui.lightText, backgroundColor: ui.negative },
  { tag: t.inserted, color: ui.darkText, backgroundColor: ui.positive },

  // ??
  { tag: [t.color, t.constant(t.name), t.standard(t.name)], color: syntax.apricot },
  { tag: [t.atom, t.bool, t.special(t.variableName)], color: syntax.lavender },
  { tag: t.invalid, color: syntax.cranberry },
]);

export const HorizonTheme = EditorView.theme(
  {
    '&': {
      color: ui.lightText,
      backgroundColor: ui.background,
      height: '100%',
    },

    '.cm-content': {
      caretColor: ui.secondaryAccent,
      fontFamily: `'Source Code Pro', ui-monospace, monospace, sans-serif`,
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
    '&.cm-focused .cm-matchingBracket': {
      'background-color': `${ui.backgroundAlt}`,
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
      outline: `1px solid ${ui.backgroundAlt}`,
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
