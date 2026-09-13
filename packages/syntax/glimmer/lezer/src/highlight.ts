import { styleTags, tags as t } from '@lezer/highlight';

export const glimmerHighlighting = styleTags({
  'Comment MoustacheComment LongMoustacheComment': t.blockComment,
  Text: t.content,

  'StartTag StartCloseTag SelfClosingEndTag EndTag': t.angleBracket,
  TagName: t.tagName,
  NamedBlock: t.tagName,
  ComponentName: t.className,
  'MismatchedCloseTag/TagName': [t.tagName, t.invalid],

  AttributeName: t.attributeName,
  StyleAttributeName: t.propertyName,
  UnquotedAttributeValue: t.attributeValue,
  'DoubleQuote SingleQuote AttributeValueContent': t.attributeValue,
  Is: t.definitionOperator,
  Splattributes: t.derefOperator,

  as: t.definitionKeyword,
  'BlockParam/AttributeName': t.definition(t.variableName),
  '|': t.punctuation,

  '{{ }} {{{ }}}': t.brace,
  BlockPrefix: t.controlKeyword,
  BlockType: t.controlKeyword,
  if: t.controlKeyword,
  'UnknownBlock/BlockType': t.invalid,
  UnknownBlockContent: t.invalid,

  'EntityReference CharacterReference': t.character,
  InvalidEntity: t.invalid,
  ProcessingInst: t.processingInstruction,
  DoctypeDecl: t.documentMeta,
});
