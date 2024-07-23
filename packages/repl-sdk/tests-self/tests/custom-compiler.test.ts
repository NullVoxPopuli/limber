import { describe, expect, test } from 'vitest'
import { Compiler } from 'repl-sdk';


function createComplier() {
  return new Compiler({
    formats: {
      mermaid: {
        compiler: async () => {
          const { default: mermaid } = await import('https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.esm.min.mjs');

          // mermaid.initialize({ startOnLoad: false });
          let id = 0;
          return {
            compile: async (text) => {
              return `export default \`${text}\`;`;
            },
            render: async (element, text) => {
              let { svg } = await mermaid.render('graphDiv' + id++, text);

              element.innerHTML = svg;

              mermaid.run({ nodes: [element], securityLevel: 'loose' });
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

    let rootSVG = element.querySelector('svg');
    console.log(element.innerHTML);
    expect(rootSVG, "Mermaid draws in SVG inside the <pre> tag").toBeTruthy();
  });
});

