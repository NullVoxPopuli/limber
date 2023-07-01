import { styleTags, tags as t } from '@lezer/highlight';

export const expressionHighlighting = styleTags({
  'AtKeyword import charset namespace keyframes media supports': t.definitionKeyword,
  NumberLiteral: t.number,
  KeywordQuery: t.keyword,
  VariableName: t.variableName,
  '( )': t.paren,
  '[ ]': t.squareBracket,
  '{ }': t.brace,

  // TODO
  Argument: t.propertyName,

  yield: t.operatorKeyword,
  outlet: t.operatorKeyword,

  component: t.function(t.definitionKeyword),
  modifier: t.function(t.definitionKeyword),
  helper: t.function(t.definitionKeyword),
  hash: t.function(t.definitionKeyword),
  array: t.function(t.definitionKeyword),
  on: t.function(t.definitionKeyword),
  concat: t.function(t.operatorKeyword),
});
