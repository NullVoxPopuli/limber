/**
 * The Horizon Theme
 *  - with modifications from the GlimmerX Playground
 *    https://github.com/glimmerjs/glimmer-experimental/tree/master/packages/examples/playground
 *  - adapted to have a darker background for limber.glimdown.com
 */

import type * as monaco from 'monaco-editor';

const syntax = {
  lavender: '#B877DB',
  cranberry: '#E95678',
  turquoise: '#25B0BC',
  apricot: '#F09483',
  rosebud: '#FAB795',
  tacao: '#FAC29A',
  gray: '#BBBBBB',
};

const ui = {
  shadow: '#161e2b',
  border: '#1a2332',
  background: '#27272a', // bg-gray-800
  backgroundAlt: '#252f41',
  accent: '#323c4d',
  accentAlt: '#4d5664',
  secondaryAccent: '#E9436D',
  secondaryAccentAlt: '#E95378',
  tertiaryAccent: '#FAB38E',
  positive: '#09F7A0',
  negative: '#F43E5C',
  warning: '#27D797',
  modified: '#21BFC2',
  lightText: '#D5D8DA',
  darkText: '#06060C',
};

const alpha = {
  high: 'E6',
  highMed: 'B3',
  med: '80',
  medLow: '4D',
  low: '1A',
  none: '00',
};

export const HorizonTheme: monaco.editor.IStandaloneThemeData = {
  base: 'vs-dark',
  inherit: true,
  colors: {
    focusBorder: `${ui.border}`,
    foreground: `${ui.lightText}`,
    'widget.shadow': `${ui.shadow}`,
    'selection.background': `${ui.accentAlt}${alpha.med}`,
    errorForeground: `${ui.negative}`,
    'textLink.activeForeground': `${ui.secondaryAccent}`,
    'textLink.foreground': `${ui.secondaryAccentAlt}`,
    'button.background': `${ui.accent}`,
    'dropdown.background': `${ui.backgroundAlt}`,
    'dropdown.listBackground': `${ui.accent}`,
    'input.background': `${ui.accent}`,
    'inputOption.activeBorder': `${ui.secondaryAccent}${alpha.med}`,
    'inputValidation.errorBackground': `${ui.negative}${alpha.med}`,
    'inputValidation.errorBorder': `${ui.negative}${alpha.none}`,
    'scrollbar.shadow': `${ui.shadow}`,
    'scrollbarSlider.activeBackground': `${ui.accentAlt}${alpha.med}`,
    'scrollbarSlider.background': `${ui.accentAlt}${alpha.low}`,
    'scrollbarSlider.hoverBackground': `${ui.accentAlt}${alpha.medLow}`,
    'badge.foreground': `${ui.lightText}`,
    'badge.background': `${ui.accent}`,
    'progressBar.background': `${ui.secondaryAccentAlt}`,
    'list.activeSelectionBackground': `${ui.accent}${alpha.med}`,
    'list.activeSelectionForeground': `${ui.lightText}`,
    'list.dropBackground': `${ui.accentAlt}${alpha.med}`,
    'list.focusBackground': `${ui.accent}${alpha.med}`,
    'list.focusForeground': `${ui.lightText}`,
    'list.highlightForeground': `${ui.secondaryAccentAlt}`,
    'list.hoverBackground': `${ui.accent}${alpha.med}`,
    'list.hoverForeground': `${ui.lightText}`,
    'list.inactiveSelectionBackground': `${ui.accent}${alpha.medLow}`,
    'list.inactiveSelectionForeground': `${ui.lightText}`,
    'list.inactiveFocusBackground': `${ui.accent}${alpha.med}`,
    'list.errorForeground': `${ui.negative}${alpha.high}`,
    'list.warningForeground': `${ui.warning}${alpha.highMed}`,
    'editorGroup.border': `${ui.border}`,
    'editorGroup.dropBackground': `${ui.accentAlt}${alpha.medLow}`,
    'editorGroupHeader.tabsBackground': `${ui.background}`,
    'editor.background': `${ui.background}`,
    'editorLineNumber.foreground': `${ui.lightText}${alpha.low}`,
    'editorLineNumber.activeForeground': `${ui.lightText}${alpha.med}`,
    'editorCursor.background': `${ui.background}`,
    'editorCursor.foreground': `${ui.secondaryAccentAlt}`,
    'editor.selectionBackground': `${ui.accent}${alpha.highMed}`,
    'editor.selectionHighlightBackground': `${ui.accentAlt}${alpha.medLow}`,
    'editor.wordHighlightBackground': `${ui.accentAlt}${alpha.med}`,
    'editor.wordHighlightStrongBackground': `${ui.accentAlt}${alpha.med}`,
    'editor.findMatchBackground': `${ui.accentAlt}${alpha.med}`,
    'editor.findMatchHighlightBackground': `${ui.accentAlt}${alpha.medLow}`,
    'editor.findRangeHighlightBackground': `${ui.accentAlt}${alpha.low}`,
    'editor.hoverHighlightBackground': `${ui.accentAlt}${alpha.medLow}`,
    'editor.lineHighlightBackground': `${ui.accent}${alpha.medLow}`,
    'editor.rangeHighlightBackground': `${ui.accent}${alpha.med}`,
    'editorIndentGuide.background': `${ui.accent}${alpha.med}`,
    'editorIndentGuide.activeBackground': `${ui.accent}`,
    'editorRuler.foreground': `${ui.accentAlt}${alpha.medLow}`,
    'editorCodeLens.foreground': `${ui.accentAlt}${alpha.med}`,
    'editorBracketMatch.background': `${ui.accentAlt}${alpha.med}`,
    'editorBracketMatch.border': `${ui.accentAlt}${alpha.none}`,
    'editorOverviewRuler.border': `${ui.accent}${alpha.highMed}`,
    'editorOverviewRuler.findMatchForeground': `${ui.accentAlt}`,
    'editorOverviewRuler.modifiedForeground': `${ui.modified}${alpha.med}`,
    'editorOverviewRuler.addedForeground': `${ui.positive}${alpha.med}`,
    'editorOverviewRuler.deletedForeground': `${ui.negative}${alpha.med}`,
    'editorOverviewRuler.errorForeground': `${ui.negative}${alpha.high}`,
    'editorOverviewRuler.warningForeground': `${ui.warning}${alpha.med}`,
    'editorOverviewRuler.bracketMatchForeground': `${ui.lightText}${alpha.med}`,
    'editorError.foreground': `${ui.negative}`,
    'editorWarning.foreground': `${ui.warning}${alpha.highMed}`,
    'editorGutter.modifiedBackground': `${ui.modified}${alpha.highMed}`,
    'editorGutter.addedBackground': `${ui.positive}${alpha.highMed}`,
    'editorGutter.deletedBackground': `${ui.negative}${alpha.highMed}`,
    'diffEditor.insertedTextBackground': `${ui.positive}${alpha.low}`,
    'diffEditor.removedTextBackground': `${ui.negative}${alpha.low}`,
    'editorWidget.background': `${ui.backgroundAlt}`,
    'editorWidget.border': `${ui.backgroundAlt}`,
    'editorSuggestWidget.highlightForeground': `${ui.secondaryAccentAlt}`,
    'peekView.border': `${ui.border}`,
    'peekViewEditor.background': `${ui.backgroundAlt}`,
    'peekViewEditor.matchHighlightBackground': `${ui.accentAlt}${alpha.med}`,
    'peekViewResult.background': `${ui.backgroundAlt}`,
    'peekViewResult.matchHighlightBackground': `${ui.accentAlt}${alpha.med}`,
    'peekViewResult.selectionBackground': `${ui.accent}${alpha.med}`,
    'peekViewTitle.background': `${ui.backgroundAlt}`,
  },
  rules: [
    {
      token: 'delimiter',
      foreground: `${syntax.gray}`,
    },
    {
      token: 'keyword',
      foreground: `${syntax.lavender}${alpha.high}`,
      fontStyle: 'italic',
    },
    {
      token: 'comment',
      foreground: `${syntax.gray}${alpha.medLow}`,
      fontStyle: 'italic',
    },
    {
      token: 'number',
      foreground: `${syntax.apricot}${alpha.high}`,
    },
    {
      token: 'type.identifier',
      foreground: `${syntax.rosebud}${alpha.high}`,
    },
    {
      token: 'identifier',
      foreground: `${syntax.cranberry}${alpha.high}`,
    },
    {
      token: 'function',
      foreground: `${syntax.turquoise}${alpha.high}`,
    },
    {
      token: 'string',
      foreground: `${syntax.rosebud}${alpha.high}`,
    },
    {
      token: 'regexp',
      foreground: `${syntax.apricot}${alpha.high}`,
    },
    {
      token: 'constant',
      foreground: `${syntax.apricot}${alpha.high}`,
    },

    // Handlebars
    {
      token: 'tag',
      foreground: `${syntax.cranberry}${alpha.high}`,
      fontStyle: 'normal',
    },
    {
      token: 'delimiter.html',
      foreground: `${syntax.cranberry}${alpha.high}`,
      fontStyle: 'normal',
    },
    {
      token: 'delimiter.handlebars',
      foreground: `${syntax.rosebud}${alpha.high}`,
      fontStyle: 'normal',
    },

    {
      token: 'attribute.name',
      foreground: `${syntax.apricot}${alpha.high}`,
      fontStyle: 'italic',
    },
    {
      token: 'attribute.value',
      foreground: `${syntax.rosebud}${alpha.high}`,
      fontStyle: 'italic',
    },
    {
      token: 'variable.parameter',
      foreground: `${syntax.cranberry}${alpha.high}`,
    },
  ],
};
