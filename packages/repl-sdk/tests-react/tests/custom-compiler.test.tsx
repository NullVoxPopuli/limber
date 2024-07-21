import { describe, expect, test } from 'vitest'
import { Compiler } from 'repl-sdk';


let compiler = new Compiler({
  formats: {
    jsx: {
      compiler: async () => {
        const { createRoot } = await import('react-dom/client');

        return {
          compile: async (text) => {
          },
          render: async (element, defaultExport) => {
            const root = createRoot(element);

            root.render(defaultExport);
          }
        };
      }
    }
  }
})

describe('Custom compiler', () => {
  test('it works', () => {
    let element = compiler.compile('jsx', `
      export default <>
        <h1>Hello World</h1>

        GENERAL KENOBI!
      </>;
    `);

    expect(element.querySelector('h1').textContent).toContain('Hello World');
    expect(element.textContent).toContain('Hello World');
  });
});

