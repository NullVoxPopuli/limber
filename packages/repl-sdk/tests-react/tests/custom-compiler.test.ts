import { describe, expect, test } from 'vitest'
import { Compiler } from 'repl-sdk';


function createComplier() {
  return new Compiler({
    formats: {
      jsx: {
        compiler: async () => {
          const { createRoot } = await import('react-dom/client');
          // @ts-ignore
          const babel = await import('@babel/standalone');

          return {
            compile: async (text) => {
              const result = babel.transform(text, {
                filename: `repl.js`,
                presets: [babel.availablePresets.react],
              });
              return result.code;
            },
            render: async (element, component) => {
              const root = createRoot(element);
              root.render(component);

              // Wait for react-dom to render
              await new Promise(resolve => requestIdleCallback(resolve))
            }
          };
        }
      }
    }
  })
}

describe('Custom compiler', () => {
  test('it works', async () => {
    let compiler = createComplier();
    // React comes from esm.sh
    let element = await compiler.compile('jsx', `
      import React from 'react';

      export default <>
        <h1>Hello World</h1>

        GENERAL KENOBI!
      </>;
    `);

    expect(element.querySelector('h1').textContent).toContain('Hello World');
    expect(element.textContent).toContain('Hello World');
  });
});

