import { Compiler } from 'repl-sdk';
import { describe, expect, test, vi } from 'vitest';

/**
 * End to end through the real Compiler: a compiled snippet imports a package
 * that is not in any manual resolver, so the only way it can run is
 *
 *   resolve  ->  file:///npm/nanoid          (synchronous, names the package)
 *   source   ->  download, unpack, resolve the exports map
 *            ->  file:///npm/nanoid@6.0.1/index.browser.js
 *   resolve  ->  ./url-alphabet/index.js against that URL, by URL math alone
 */
function passthrough() {
  return new Compiler({
    formats: {
      custom: {
        compiler: async () => ({
          compile: async (text: string) => text,
          render: async (element: HTMLElement, defaultExport: unknown) => {
            element.textContent = String(defaultExport);
          },
        }),
      },
    },
  });
}

/**
 * The fs is one per page and es-module-shims keeps modules by URL, so a
 * package is read from the fs the first time any test imports it and never
 * again. Watch from the start.
 */
const read = vi.spyOn(passthrough().fs, 'read');

describe('npm through the Compiler', () => {
  test('installs a package and runs code that imports it', async () => {
    const compiler = passthrough();

    const { element } = await compiler.compile(
      'custom',
      `
        import { nanoid, urlAlphabet } from 'nanoid';

        export default [nanoid(12).length, urlAlphabet.length > 0].join(',');
      `
    );

    expect(element.textContent).toBe('12,true');
  });

  test('the files it downloaded are addressable', async () => {
    const compiler = passthrough();

    await compiler.compile(
      'custom',
      `
        import { nanoid } from 'nanoid';

        export default nanoid(5);
      `
    );

    const urls = compiler.fs.list('file:///npm/nanoid@');

    expect(urls.length).toBeGreaterThan(3);

    for (const url of urls) {
      expect(url).not.toContain('repl-request-');
    }

    /**
     * The relative import inside the package was served from the path it
     * actually lives at, which is the thing the request-id scheme could not do.
     */
    const reads = read.mock.calls.map(([url]) => url);

    expect(reads.some((url) => url.endsWith('/url-alphabet/index.js'))).toBe(true);
  });

  test('a subpath export resolves through the exports map', async () => {
    const compiler = passthrough();

    const { element } = await compiler.compile(
      'custom',
      `
        import { nanoid } from 'nanoid/non-secure';

        export default nanoid(7).length;
      `
    );

    expect(element.textContent).toBe('7');
  });
});
