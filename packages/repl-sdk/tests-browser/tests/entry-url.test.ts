import { Compiler } from 'repl-sdk';
import { describe, expect, test, vi } from 'vitest';

function passthrough(logging = false) {
  return new Compiler({
    logging,
    formats: {
      custom: {
        compiler: async () => ({
          compile: async (text: string) => text,
          render: async (element: HTMLElement, value: unknown) => {
            element.textContent = String(value);
          },
        }),
      },
    },
  });
}

describe('the compiled snippet has a URL', () => {
  test('nothing is resolved through a blob', async () => {
    const lines: string[] = [];
    const debug = vi.spyOn(console, 'debug').mockImplementation((...args: unknown[]) => {
      lines.push(args.map((a) => String(a)).join(' '));
    });

    const compiler = passthrough(true);

    await compiler.compile(
      'custom',
      `
        import { nanoid } from 'nanoid';

        export default nanoid(4);
      `
    );

    debug.mockRestore();

    const hooks = lines.filter((l) => l.includes('[resolve]') || l.includes('[source]'));

    expect(hooks.length).toBeGreaterThan(0);
    expect(hooks.filter((l) => l.includes('blob:'))).toEqual([]);
  });

  test('recompiling evaluates the new code', async () => {
    const compiler = passthrough();

    const first = await compiler.compile('custom', `export default 'first';`);
    const second = await compiler.compile('custom', `export default 'second';`);

    expect(first.element.textContent).toBe('first');
    expect(second.element.textContent).toBe('second');
  });

  test('the entry lives at a path a sibling could resolve against', async () => {
    const compiler = passthrough();
    const seen: string[] = [];
    const debug = vi.spyOn(console, 'debug').mockImplementation((...args: unknown[]) => {
      const line = args.map((a) => String(a)).join(' ');

      if (line.includes('[source] project')) seen.push(line.split(' ').pop() as string);
    });

    await passthrough(true).compile('custom', `export default 'placeholder';`);
    debug.mockRestore();

    const [entryUrl] = seen;

    expect(entryUrl).toMatch(/^file:\/\/\/project\/\d+\/dynamic\.custom$/);

    /**
     * This is the mechanism #1892 and #946 need: a relative specifier from the
     * snippet now has something real to resolve against.
     */
    expect(new URL('./sibling.js', entryUrl).href).toBe(
      entryUrl!.replace('dynamic.custom', 'sibling.js')
    );

    expect(compiler).toBeTruthy();
  });

  test('the source is released once the module exists', async () => {
    const compiler = passthrough();

    for (let i = 0; i < 6; i++) {
      await compiler.compile('custom', `export default 'rev-${i}';`);
    }

    expect(compiler.fs.list('file:///project/')).toEqual([]);
  });
});
