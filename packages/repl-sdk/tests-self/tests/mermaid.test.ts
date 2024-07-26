import { Compiler } from 'repl-sdk';
import { describe, expect, test } from 'vitest';

describe('Custom compiler', () => {
  test('it works', async () => {
    let compiler = new Compiler();
    // Vue comes from esm.sh
    let element = await compiler.compile(
      'mermaid',
      `
  graph TD

  A[Client] --> B[Load Balancer]
  B --> C[Server01]
  B --> D[Server02]
    `
    );

    // getComputedStyle doesn't work without the element existing in the document
    document.body.appendChild(element);

    let rootSVG = element.querySelector('svg');

    expect(rootSVG, 'Mermaid draws in SVG inside the <pre> tag').toBeTruthy();
  });
});
