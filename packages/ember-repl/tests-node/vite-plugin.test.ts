import { renderComponent } from '@ember/renderer';

import { describe, expect, test } from 'vitest';

// @ts-expect-error the vite plugin in vitest.config.mjs compiles this file
import Doc from './fixtures/doc.gjs.md';

describe('ember-repl/vite', () => {
  test('a markdown file is a component that renders', async () => {
    const element = document.createElement('div');

    document.body.append(element);

    const result = renderComponent(Doc, { into: element });

    await Promise.resolve();

    expect(element.querySelector('h1')?.textContent).toBe('Title');
    expect(element.querySelector('p em')?.textContent).toBe('hello prose');
    expect(element.querySelector('output.one')?.textContent?.trim()).toBe(
      'class'
    );
    expect(element.querySelector('output.two')?.textContent?.trim()).toBe(
      'hello hbs'
    );
    expect(element.querySelector('pre code')?.textContent).toContain('notLive');

    result.destroy();
  });
});
