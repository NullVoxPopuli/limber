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
      const { element } = await compiler.compile(
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
    });
  });
});
