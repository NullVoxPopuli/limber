import { Compiler } from 'repl-sdk';
import { describe, expect, test } from 'vitest';

describe('custom', () => {
  test('it works', async () => {
    const compiler = new Compiler({
      formats: {
        custom: {
          compiler: async () => {
            return {
              compile: async (text) => {
                return `export default \`${text + '!!'} \``;
              },
              render: async (element, compiled) => {
                element.innerHTML = compiled;
              },
            };
          },
        },
      },
    });

    const element = await compiler.compile('custom', `example text`);

    expect(element.textContent).toContain('example text!!');
  });
});
