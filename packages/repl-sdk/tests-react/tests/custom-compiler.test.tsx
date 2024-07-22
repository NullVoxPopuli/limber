import { describe, expect, test } from 'vitest'
import { Compiler } from 'repl-sdk';


function createComplier() {
  return new Compiler({
    formats: {
      jsx: {
        compiler: async () => {
          const { createRoot } = await import('react-dom/client');
          const swc = await ("@swc/wasm-web");

          // @ts-ignore
          await swc.init();

          return {
            compile: async (text) => {
              // @ts-ignore
              const result = swc.transformSync(text, {
                jsc: {
                  parser: {
                    syntax: 'ecmascript',
                    jsx: true,
                  },
                  target: 'es2022',
                },
                module: {
                  type: 'es6'
                },
                minify: false,
                isModule: true,
                sourceMaps: 'inline'
              });

              return result.code;
            },
            render: async (element, defaultExport) => {
              console.log(defaultExport);
              const root = createRoot(element);

              root.render(defaultExport);
            }
          };
        }
      }
    }
  })
}

describe('Custom compiler', () => {
  test('it works', () => {
    let compiler = createComplier();
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

