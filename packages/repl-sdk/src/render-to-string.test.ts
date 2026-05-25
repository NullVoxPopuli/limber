import { describe, expect, test } from 'vitest';

import {
  buildGmdModule,
  mergeImports,
  replacePlaceholder,
  splitModule,
  wrapAsConst,
} from './render-to-string.js';

describe('splitModule', () => {
  test('separates single-line imports from body', () => {
    const source = [
      `import X from 'x';`,
      `import { y } from 'y';`,
      ``,
      `const _component = makeIt();`,
      `export default _component;`,
    ].join('\n');

    const { imports, body } = splitModule(source);

    expect(imports).toEqual([`import X from 'x';`, `import { y } from 'y';`]);
    expect(body).toContain('const _component = makeIt();');
    expect(body).toContain('return _component;');
    expect(body).not.toContain('export default');
  });

  test('handles multi-line braced imports', () => {
    const source = [
      `import {`,
      `  a,`,
      `  b,`,
      `} from 'x';`,
      ``,
      `const _component = a;`,
      `export default _component;`,
    ].join('\n');

    const { imports, body } = splitModule(source);

    expect(imports).toHaveLength(1);
    expect(imports[0]).toContain('a,');
    expect(imports[0]).toContain('b,');
    expect(body).toContain('return _component;');
  });

  test('handles side-effect imports with no specifiers', () => {
    const source = [`import 'side-effect';`, `const k = 1;`, `export default k;`].join('\n');

    const { imports, body } = splitModule(source);

    expect(imports).toEqual([`import 'side-effect';`]);
    expect(body).toContain('return k;');
  });

  test('handles import with attributes', () => {
    const source = [
      `import data from './x.json' with { type: 'json' };`,
      `export default data;`,
    ].join('\n');

    const { imports } = splitModule(source);

    expect(imports).toHaveLength(1);
    expect(imports[0]).toContain('with');
  });

  test('rewrites only the last export default', () => {
    const source = [
      `import X from 'x';`,
      `// a comment that mentions export default`,
      `const v = 1;`,
      `export default v;`,
    ].join('\n');

    const { body } = splitModule(source);

    expect(body).toContain('return v;');
    expect(body).not.toContain('return v;\n');
    // The comment should still be present (not rewritten)
    expect(body).toContain('export default');
    // ...but the original statement is gone — only the comment retains the phrase
    expect(body.match(/return\s+v/g)?.length ?? 0).toBeGreaterThan(0);
  });

  test('leaves body unchanged when there is no default export', () => {
    const source = [`import X from 'x';`, `const v = 1;`].join('\n');

    const { body } = splitModule(source);

    expect(body).not.toContain('return');
    expect(body).toContain('const v = 1;');
  });
});

describe('mergeImports', () => {
  test('deduplicates exact-match imports', () => {
    const merged = mergeImports([
      [`import X from 'x';`, `import { y } from 'y';`],
      [`import X from 'x';`, `import Z from 'z';`],
    ]);

    expect(merged).toEqual([`import X from 'x';`, `import { y } from 'y';`, `import Z from 'z';`]);
  });

  test('does not collapse different specifiers from the same module', () => {
    const merged = mergeImports([[`import { a } from 'x';`], [`import { b } from 'x';`]]);

    expect(merged).toHaveLength(2);
  });
});

describe('wrapAsConst', () => {
  test('wraps body in an IIFE-returning const', () => {
    const out = wrapAsConst(`const v = 1;\nreturn v;`, 'Demo1');

    expect(out).toMatch(/^const Demo1 = \(\(\) => \{/);
    expect(out).toMatch(/\}\)\(\);$/);
    expect(out).toContain('const v = 1;');
    expect(out).toContain('return v;');
  });
});

describe('replacePlaceholder', () => {
  test('preserves the placeholder div + class, wraps a component invocation', () => {
    const html = `<p>before</p><div id="repl_1" class="repl-sdk__demo"></div><p>after</p>`;
    const out = replacePlaceholder(html, 'repl_1', 'Demo1');

    expect(out).toBe(`<p>before</p><div class="repl-sdk__demo"><Demo1 /></div><p>after</p>`);
  });

  test('escapes regex metacharacters in the id', () => {
    const html = `<div id="a.b.c" class=""></div>`;
    const out = replacePlaceholder(html, 'a.b.c', 'Demo1');

    expect(out).toBe(`<div class=""><Demo1 /></div>`);
  });

  test('does not touch divs with different ids', () => {
    const html = `<div id="other"></div><div id="repl_1" class=""></div>`;
    const out = replacePlaceholder(html, 'repl_1', 'Demo1');

    expect(out).toContain(`<div id="other">`);
    expect(out).toContain(`<Demo1 />`);
  });

  test('omits class attribute when the placeholder had none', () => {
    const html = `<div id="x"></div>`;
    const out = replacePlaceholder(html, 'x', 'Demo1');

    expect(out).toBe(`<div><Demo1 /></div>`);
  });
});

describe('buildGmdModule', () => {
  test('build-time form: inlines one demo with build-time template-compiler', () => {
    const demoSource = [
      `import Component from '@glimmer/component';`,
      `import { template } from '@ember/template-compiler';`,
      `class _Greeting extends Component {`,
      `  name = 'world';`,
      `}`,
      `const _component = template('Hi', { scope: () => ({}) }, _Greeting);`,
      `export default _component;`,
    ].join('\n');

    const out = buildGmdModule({
      prose: `<h1>Hello</h1><div id="repl_1" class="demo"></div>`,
      demos: [{ name: 'Demo1', placeholderId: 'repl_1', source: demoSource }],
    });

    // build-time `template` is the default
    expect(out).toContain(`import { template } from '@ember/template-compiler';`);
    // Demo's own template-compiler import is deduped against the prose's
    expect(out.match(/import \{ template \} from '@ember\/template-compiler';/g)?.length).toBe(1);
    expect(out).toContain(`import Component from '@glimmer/component';`);

    // Demo body wrapped in a named IIFE and referenced from prose. The
    // prose lives inside a `template(JSON.stringify(...))` call, so double-
    // quotes in the rewritten div are JSON-escaped.
    expect(out).toMatch(/const Demo1 = \(\(\) => \{[\s\S]*\}\)\(\);/);
    expect(out).toContain(`<div class=\\"demo\\"><Demo1 /></div>`);
    expect(out).not.toContain(`<div id="repl_1"`);
    expect(out).not.toContain(`<div id=\\"repl_1\\"`);

    // Scope contains only Demo1
    expect(out).toMatch(/scope: \(\) => \(\{ Demo1 \}\)/);
    expect(out).toMatch(/export default _component;/);
  });

  test('runtime form: imports runtime template-compiler and threads scope via a virtual module specifier', () => {
    const out = buildGmdModule({
      prose: `<h1>Hello</h1>`,
      demos: [],
      templateModule: '@ember/template-compiler/runtime',
      scope: {
        specifier: 'repl-sdk:gmd-scope:42',
        keys: ['array', 'concat'],
      },
    });

    expect(out).toContain(`import { template } from '@ember/template-compiler/runtime';`);
    expect(out).toContain(`import * as __scope__ from 'repl-sdk:gmd-scope:42';`);
    expect(out).toContain(`const { array, concat } = __scope__;`);
    // Live scope keys spread into the template scope
    expect(out).toMatch(/scope: \(\) => \(\{ array, concat \}\)/);
  });

  test('handles zero demos', () => {
    const out = buildGmdModule({
      prose: `<h1>Hello</h1>`,
      demos: [],
    });

    expect(out).toContain(`import { template } from '@ember/template-compiler';`);
    expect(out).toMatch(/scope: \(\) => \(\{\}\)/);
    expect(out).not.toMatch(/const Demo\d+ = /);
  });

  test('emits multiple demos in declaration order, merging shared imports', () => {
    const make = (n: number) =>
      [
        `import Component from '@glimmer/component';`,
        `const _component = ${n};`,
        `export default _component;`,
      ].join('\n');

    const out = buildGmdModule({
      prose: `<div id="a"></div><div id="b"></div>`,
      demos: [
        { name: 'Demo1', placeholderId: 'a', source: make(1) },
        { name: 'Demo2', placeholderId: 'b', source: make(2) },
      ],
    });

    expect(out.indexOf('const Demo1 ')).toBeLessThan(out.indexOf('const Demo2 '));
    expect(out).toMatch(/scope: \(\) => \(\{ Demo1, Demo2 \}\)/);
    expect(out.match(/import Component from '@glimmer\/component';/g)?.length).toBe(1);
  });

  test('runtime + demos: live-scope keys come before demo names in scope', () => {
    const make = (n: number) =>
      [`const _component = ${n};`, `export default _component;`].join('\n');

    const out = buildGmdModule({
      prose: `<div id="a"></div>`,
      demos: [{ name: 'Demo1', placeholderId: 'a', source: make(1) }],
      templateModule: '@ember/template-compiler/runtime',
      scope: {
        specifier: 'repl-sdk:gmd-scope:7',
        keys: ['on'],
      },
    });

    expect(out).toMatch(/scope: \(\) => \(\{ on, Demo1 \}\)/);
  });
});
