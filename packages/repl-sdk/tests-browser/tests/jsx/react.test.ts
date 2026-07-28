import { Compiler } from 'repl-sdk';
import { describe, expect, test } from 'vitest';

import { reactModules } from '../setup.ts';

describe('jsx', () => {
  describe('react', () => {
    test('it works', async () => {
      const compiler = new Compiler({
        resolve: {
          ...reactModules,
        },
      });
      // React comes from esm.sh
      const { element, destroy } = await compiler.compile(
        'jsx',
        `
        import React from 'react';

        export default <>
          <h1>Hello World</h1>

          GENERAL KENOBI!
        </>;
      `,
        { flavor: 'react' }
      );

      expect(element.querySelector('h1')?.textContent).toContain('Hello World');
      expect(element.textContent).toContain('Hello World');

      // destroy unmounts the react root, so the demo can be garbage-collected
      destroy();
      expect(element.querySelector('h1')).toBeNull();
    });

    test('it renders against a production-built react', async () => {
      const compiler = new Compiler({
        resolve: {
          ...reactModules,
          // @ts-expect-error Does not provide its own types
          'react/jsx-runtime': () => import('react/jsx-runtime'),
          /**
           * What a *production* build of react exports from this entry: the
           * dev-only JSX factory is deliberately undefined. Compiling demos
           * with babel's development JSX transform emits calls to it, so
           * every demo would throw "_jsxDEV is not a function" against such
           * a host (dev-built hosts hide this — they ship a real jsxDEV).
           */
          'react/jsx-dev-runtime': () => Promise.resolve({ jsxDEV: undefined }),
        },
      });

      const { element } = await compiler.compile('jsx', `export default <h1>Hello World</h1>;`, {
        flavor: 'react',
      });

      expect(element.querySelector('h1')?.textContent).toContain('Hello World');
    });
  });
});
