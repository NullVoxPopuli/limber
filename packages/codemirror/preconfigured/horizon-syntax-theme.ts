/* eslint-disable prettier/prettier */
import { HighlightStyle, tags as t } from '@codemirror/highlight';
import { alpha, syntax, ui } from '@nullvoxpopuli/horizon-theme';

export const HorizonSyntaxTheme = HighlightStyle.define([
  { tag: [t.meta, t.comment],        color: `${syntax.gray}${alpha.medLow}` },
  { tag: t.number,                   color: `${syntax.apricot}${alpha.high}` },
  { tag: t.string,                   color: `${syntax.rosebud}${alpha.high}` },
  { tag: t.regexp,                   color: `${syntax.apricot}${alpha.high}` },
  { tag: t.constant(t.name),         color: `${syntax.apricot}${alpha.high}` },
  { tag: t.keyword,                  color: `${syntax.lavender}${alpha.high}`, fontStyle: 'italic' },
  { tag: t.link, textDecoration: 'underline' },
  { tag: t.strong, fontWeight: 'bold' },
  { tag: t.emphasis, fontStyle: 'italic' },
  { tag: t.heading,                  color: `${syntax.lavender}${alpha.high}`, fontWeight: 'bold' },
  { tag: t.definition(t.name),       color: `${syntax.cranberry}${alpha.high}` },
  { tag: t.className,                color: `${syntax.cranberry}${alpha.high}` },
  { tag: t.typeName,                 color: `${syntax.cranberry}${alpha.high}` },
  { tag: t.propertyName,             color: `${syntax.apricot}${alpha.high}`, fontStyle: 'italic' },
  { tag: t.function(t.variableName), color: `${syntax.turquoise}${alpha.high}` },
  { tag: t.labelName,                color: `${syntax.rosebud}${alpha.high}` },
  { tag: t.self,                     color: `${syntax.cranberry}${alpha.high}` },
  { tag: t.namespace,                color: `${syntax.cranberry}${alpha.high}` },
  { tag: t.separator,                color: `${syntax.gray}${alpha.medLow}` },
  { tag: t.changed,                  color: syntax.tacao },
  { tag: t.annotation,               color: syntax.gray },
  { tag: t.operator,                 color: `${syntax.apricot}${alpha.high}` },
  { tag: t.operatorKeyword,          color: `${syntax.apricot}${alpha.high}` },
  { tag: t.special(t.string),        color: syntax.turquoise },
  { tag: t.processingInstruction,    color: syntax.rosebud },

  { tag: [t.name, t.character, t.macroName], color: syntax.lavender },
  { tag: t.deleted, color: ui.lightText, backgroundColor: ui.negative },
  { tag: t.inserted, color: ui.darkText, backgroundColor: ui.positive },

  // ??
  { tag: [t.color, t.constant(t.name), t.standard(t.name)], color: syntax.apricot },
  { tag: [t.atom, t.bool, t.special(t.variableName)], color: syntax.lavender },
  { tag: t.invalid, color: syntax.cranberry },
]);
