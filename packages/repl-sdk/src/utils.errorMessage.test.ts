import { describe, expect, it } from 'vitest';

import { errorMessage } from './utils.js';

describe('errorMessage', () => {
  it('handles non-object throwables', () => {
    expect(errorMessage('boom')).toBe('boom');
    expect(errorMessage(undefined)).toBe('undefined');
    expect(errorMessage(null)).toBe('null');
    expect(errorMessage(2)).toBe('2');
  });

  it('uses the message of a normal Error', () => {
    expect(errorMessage(new Error('boom'))).toBe('boom');
  });

  it('falls back to String() for objects without message or source_code', () => {
    expect(errorMessage({})).toBe('[object Object]');
  });

  it('includes the source_code of an SWC-style error (as thrown by content-tag)', () => {
    /**
     * Real shape from content-tag's `Preprocessor#process`:
     * an Error with extra own properties: source_code, source_code_color
     */
    const swcError = Object.assign(new Error('Parse Error at dynamic-repl.js:1:9: 1:10'), {
      source_code:
        '  × Expression expected\n' +
        '   ╭─[dynamic-repl.js:1:1]\n' +
        ' 1 │ let y = ;\n' +
        '   ·         ─\n' +
        '   ╰────',
    });

    expect(errorMessage(swcError)).toMatchInlineSnapshot(`
      "Parse Error at dynamic-repl.js:1:9: 1:10

        × Expression expected
         ╭─[dynamic-repl.js:1:1]
       1 │ let y = ;
         ·         ─
         ╰────"
    `);
  });
});
