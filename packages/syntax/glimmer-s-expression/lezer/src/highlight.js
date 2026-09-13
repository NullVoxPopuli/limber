import { styleTags, tags as t } from '@lezer/highlight';

export const expressionHighlighting = styleTags({
  'Callee/PathExpression/PathHead': t.function(t.variableName),
  PathHead: t.variableName,
  PropertyName: t.propertyName,
  this: t.self,
  Argument: t.propertyName,

  HashKey: t.attributeName,
  Is: t.definitionOperator,

  StringLiteral: t.string,
  NumberLiteral: t.number,
  BooleanLiteral: t.bool,
  'NullLiteral UndefinedLiteral': t.null,

  as: t.definitionKeyword,
  BlockParam: t.definition(t.variableName),

  '( )': t.paren,
  '| ~': t.punctuation,
  '.': t.derefOperator,

  'if unless each each-in let in-element yield outlet debugger': t.controlKeyword,
  'on fn hash array concat get log component helper modifier has-block has-block-params unique-id':
    t.keyword,
  'eq neq not-eq not and or gt gte lt lte': t.operatorKeyword,
});
