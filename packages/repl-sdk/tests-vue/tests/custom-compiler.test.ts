import { describe, expect, test } from 'vitest'
import { Compiler } from 'repl-sdk';


function createComplier() {
  return new Compiler({
    formats: {
      vue: {
        compiler: async () => {
          const { createApp } = await import('vue');
          const { compileFile, useStore } = await import('@vue/repl');
          const store = useStore();

          return {
            compile: async (text, fileName) => {
              const output = { js: '', css: '', ssr: '' };

              // @ts-ignore
              await compileFile(store, {
                code: text,
                filename: fileName,
                language: 'vue',
                compiled: output,
              });

              return { compiled: output.js, css: output.css };
            },
            render: async (element, component, { css, compiled }) => {
              let div = document.createElement('div');
              let style = document.createElement('style');

              style.innerHTML = css;

              element.appendChild(div);
              element.appendChild(style);

              createApp(component).mount(div);

              // Wait for render
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
    // Vue comes from esm.sh
    let element = await compiler.compile('vue', `
      <style scoped>
        h1 { color: red; }
      </style>
      <script setup>
        import { ref } from 'vue'

        const count = ref(0)
      </script>

      <template>
        <h1>Hello World</h1>

        GENERAL KENOBI!
      </template>
    `);

    // getComputedStyle doesn't work without the element existing in the document
    document.body.appendChild(element);

    let h1 = element.querySelector('h1');

    expect(h1.textContent).toContain('Hello World');
    expect(window.getComputedStyle(h1).color).toBe('rgb(255, 0, 0)');
    expect(element.textContent).toContain('Hello World');
  });
});

