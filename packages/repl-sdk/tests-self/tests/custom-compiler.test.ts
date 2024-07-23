import { describe, expect, test } from 'vitest'
import { Compiler } from 'repl-sdk';


function createComplier() {
  return new Compiler({
    formats: {
      mermaid: {
        compiler: async () => {
          const { default: mermaid } = await import('https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.esm.min.mjs');

          return {
            compile: async (text, fileName) => {
              return `export default \`${text}\`;`;
            },
            render: async (element, text) => {
              let pre = document.createElement('pre');

              pre.classList.add('mermaid');
              pre.innerHTML = text;

              element.appendChild(pre);

              // Mermaid has no way to scope to an element
              mermaid.initialize({ startOnLoad: true });
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
    let element = await compiler.compile('mermaid', `
      graph TD
      A[Client] --> B[Load Balancer]
      B --> C[Server01]
      B --> D[Server02]
    `);

    // getComputedStyle doesn't work without the element existing in the document
    document.body.appendChild(element);

    console.log(element.innerHTML);

  });
});

