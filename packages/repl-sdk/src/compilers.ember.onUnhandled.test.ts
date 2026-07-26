import { describe, expect, it } from 'vitest';

import { gjs } from './compilers/ember.js';

function handleUnhandled(reason: unknown) {
  let handled: string | undefined;

  gjs.onUnhandled?.({ reason } as PromiseRejectionEvent, (message) => (handled = message));

  return handled;
}

/**
 * In apps, nothing awaits the compile state's promise, so compile errors
 * also arrive via unhandledrejection — and this handler's announcement is
 * the last one, i.e. the one the UI's error bubble shows.
 */
describe('gjs onUnhandled', () => {
  it('ignores reasons without a message', () => {
    expect(handleUnhandled(undefined)).toBe(undefined);
    expect(handleUnhandled('boom')).toBe(undefined);
  });

  it('uses the message of a normal Error', () => {
    expect(handleUnhandled(new Error('boom'))).toBe('boom');
  });

  it('includes the source_code of an SWC-style error (as thrown by content-tag)', () => {
    const swcError = Object.assign(new Error('Parse Error at dynamic-repl.js:3:16: 3:33'), {
      source_code:
        "  × Expected 'from', got 'string literal'\n" +
        '   ╭─[dynamic-repl.js:3:1]\n' +
        " 2 │ import { tracked } from '@glimmer/tracking';\n" +
        " 3 │ import { on }  '@ember/modifier';\n" +
        '   ·                ─────────────────\n' +
        '   ╰────',
    });

    expect(handleUnhandled(swcError)).toMatchInlineSnapshot(`
      "Parse Error at dynamic-repl.js:3:16: 3:33

        × Expected 'from', got 'string literal'
         ╭─[dynamic-repl.js:3:1]
       2 │ import { tracked } from '@glimmer/tracking';
       3 │ import { on }  '@ember/modifier';
         ·                ─────────────────
         ╰────"
    `);
  });

  it('points at the console for backtracking-rerender asserts', () => {
    const message = handleUnhandled(
      new Error('Assertion Failed: ...\n\nStack trace for the update:\n...')
    );

    expect(message).toContain('(see console)');
  });
});
