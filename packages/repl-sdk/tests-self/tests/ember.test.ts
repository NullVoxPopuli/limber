import { Compiler } from 'repl-sdk';
import { describe, expect, test } from 'vitest';

describe('ember', () => {
  describe('gjs', () => {
    test.skip('template-only', async () => {
      const compiler = new Compiler();
      const { element } = await compiler.compile(
        'gjs',
        `
          const name = 'world';

          <template>
            <h1>Hello {{name}}!</h1>

            <style>
              h1 { color: red; }
            </style>
          </template>
        `
      );

      // getComputedStyle doesn't work without the element existing in the document
      document.body.appendChild(element);

      const h1 = element.querySelector('h1');

      expect(h1).toBeTruthy();
      expect(h1?.textContent).toContain('Hello world!');
      expect(window.getComputedStyle(h1!).color).toBe('rgb(255, 0, 0)');
    });

    test.skip('class component', async () => {
      const compiler = new Compiler();
      const element = await compiler.compile(
        'gjs',
        `
          import Component from '@glimmer/component';

          export default class Demo extends Component {
            name = 'world';

            <template>
              <h1>Hello {{this.name}}!</h1>

              <style>
                h1 { color: red; }
              </style>
            </template>
          }
        `
      );

      // getComputedStyle doesn't work without the element existing in the document
      document.body.appendChild(element);

      const h1 = element.querySelector('h1');

      expect(h1).toBeTruthy();
      expect(h1?.textContent).toContain('Hello world!');
      expect(window.getComputedStyle(h1!).color).toBe('rgb(255, 0, 0)');
    });
  });
});
