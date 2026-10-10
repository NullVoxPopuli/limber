// @vitest-environment node
import { describe, expect, test } from 'vitest';

import { emberRepl } from '../vite/index.js';

const root = new URL('..', import.meta.url).pathname;

describe('ember-repl/vite, with no DOM', () => {
  /**
   * Slow only here: vitest sends babel itself through the app build plugins.
   */
  test(
    'the load hook compiles a markdown file',
    { timeout: 60_000 },
    async () => {
      expect(globalThis.document, 'this test has no DOM').toBeUndefined();

      const plugin = emberRepl({
        imports: `import { Greeting } from '#tests-node/fixtures/greeting.gjs';`,
      });

      plugin.configResolved({ root });

      const result = await plugin.load(`${root}tests-node/fixtures/doc.gjs.md`);
      const code = result?.code;

      expect(code).toContain(`from '#tests-node/fixtures/greeting.gjs'`);
      expect(code).toContain('const Demo1 = ');
      expect(code).toContain('const Demo2 = ');
      expect(
        code,
        'the babel config of the project compiled the templates'
      ).toContain('createTemplateFactory');
    }
  );

  test('other files are left alone', async () => {
    const plugin = emberRepl();

    expect(await plugin.load('/some/file.md')).toBeUndefined();
    expect(await plugin.load('/some/file.gjs')).toBeUndefined();
  });
});
