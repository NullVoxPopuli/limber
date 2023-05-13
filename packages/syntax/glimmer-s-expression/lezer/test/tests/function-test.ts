import { expect, test } from 'vitest';

import { parse } from './util';

test('function', () => {
  expect(parse(`(hello)`)).toMatchInlineSnapshot(`
    "Expression(
      SExpression(
        CallExpression(
          \\"(\\",SExpression,\\")\\"
        )
      )
    )"
  `);
});

test('function w/ positional', () => {
  expect(parse(`(hello "there")`)).toMatchInlineSnapshot(`
    "Expression(
      SExpression(
        CallExpression(
          \\"(\\",⚠
        )
      )  ,SExpression(
        String(
          AttributeValueContent
        )
      )  ,⚠(
        \\")\\"
      )
    )"
  `);
});

test('function w/named', () => {
  expect(parse(`(hello greeting="there")`)).toMatchInlineSnapshot(`
    "Expression(
      SExpression(
        CallExpression(
          \\"(\\",SExpression,Is,SExpression(
            String(
              AttributeValueContent
            )
          )      ,\\")\\"
        )
      )
    )"
  `);
});
