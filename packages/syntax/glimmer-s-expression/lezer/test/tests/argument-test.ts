import { expect, test } from 'vitest';

import { parse } from './util';

test('argument', () => {
  expect(parse(`@hello`)).toMatchInlineSnapshot(`
    "Expression(
      SExpression(
        Argument
      )
    )"
  `);
});

test('funcition', () => {
  expect(parse(`@hello "there"`)).toMatchInlineSnapshot(`
    "Expression(
      SExpression(
        Argument
      )  ,⚠,SExpression(
        String(
          AttributeValueContent
        )
      )
    )"
  `);
});
