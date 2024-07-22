import { describe, expect, test } from 'vitest'
import { Compiler } from 'repl-sdk';


function createComplier() {
  return new Compiler({
    formats: {
      jsx: {
        compiler: async () => {
          // const { createPortal } = await import('react-dom');
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
              // createPortal(component, element);
              const root = createRoot(element);
              root.render(component);
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
    let element = await compiler.compile('jsx', `
      import React from 'react';

      export default <>
        <h1>Hello World</h1>

        GENERAL KENOBI!
      </>;
    `);

    console.log({ element: element.innerHTML });
    expect(element.querySelector('h1').textContent).toContain('Hello World');
    expect(element.textContent).toContain('Hello World');
  });
});

