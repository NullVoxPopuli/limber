import { parseMixed } from '@lezer/common';
import { parser as javascriptParser } from '@lezer/javascript';

// import { parser as glimmerExpressionParser } from '@glimdown/lezer-glimmer-expression';
import {
  LongExpression,
  ScriptText,
  ShortExpression,
  StyleText,
  TextareaText,
} from './syntax.grammar.terms';

import type { Input, Parser, SyntaxNode, SyntaxNodeRef } from '@lezer/common';

function getAttrs(element: SyntaxNode | null, input: Input) {
  let attrs: Attrs = Object.create(null);

  if (!element) return attrs;
  if (!element.firstChild) return attrs;

  for (let att of element.firstChild.getChildren('Attribute')) {
    let name = att.getChild('AttributeName'),
      value = att.getChild('AttributeValue') || att.getChild('UnquotedAttributeValue');

    if (name)
      attrs[input.read(name.from, name.to)] = !value
        ? ''
        : value.name == 'AttributeValue'
        ? input.read(value.from + 1, value.to - 1)
        : input.read(value.from, value.to);
  }

  return attrs;
}

function maybeNest(node: SyntaxNodeRef, input: Input, tags: NestingConfig[]) {
  let attrs: Attrs = {};

  for (let tag of tags) {
    if (!tag.attrs) return { parser: tag.parser };

    let evaluatedAttrs = attrs || getAttrs(node.node.parent, input);

    if (tag.attrs(evaluatedAttrs)) return { parser: tag.parser };
  }

  return null;
}

// const expressionParser = glimmerExpressionParser;
const expressionParser = javascriptParser.configure({ top: 'SingleExpression' });

interface Attrs {
  [attr: string]: string;
}

interface NestingConfig {
  tag: string;
  attrs?: (attrs: Attrs) => boolean;
  parser: Parser;
}

export function configureNesting(tags: NestingConfig[]) {
  let script: NestingConfig[] = [];
  let style: NestingConfig[] = [];
  let textarea: NestingConfig[] = [];

  for (let tag of tags) {
    let array =
      tag.tag == 'script'
        ? script
        : tag.tag == 'style'
        ? style
        : tag.tag == 'textarea'
        ? textarea
        : null;

    if (!array)
      throw new RangeError('Only script, style, and textarea tags can host nested parsers');
    array.push(tag);
  }

  return parseMixed((node, input) => {
    let id = node.type.id;

    if (id === LongExpression) return { parser: expressionParser };
    if (id === ShortExpression) return { parser: expressionParser };
    if (id === ScriptText) return maybeNest(node, input, script);
    if (id === StyleText) return maybeNest(node, input, style);
    if (id === TextareaText) return maybeNest(node, input, textarea);

    return null;
  });
}
