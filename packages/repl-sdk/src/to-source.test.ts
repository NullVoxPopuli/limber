import { describe, expect, test } from 'vitest';

import * as babel from '@glimdown/babel-8-lite';

import { buildGmdModule, replacePlaceholder } from './to-source.js';

function build(
  prose: string,
  demos: Array<{ name: string; placeholderId: string; source: string }>
) {
  return buildGmdModule({ babel, prose, demos });
}

describe('replacePlaceholder', () => {
  test('preserves the placeholder div + class, wraps a component invocation', () => {
    const html = `<p>before</p><div id="repl_1" class="repl-sdk__demo"></div><p>after</p>`;
    const out = replacePlaceholder(html, 'repl_1', 'Demo1');

    expect(out).toBe(
      `<p>before</p><div class="repl-sdk__demo"><div data-repl-output><Demo1 /></div></div><p>after</p>`
    );
  });

  test('escapes regex metacharacters in the id', () => {
    const html = `<div id="a.b.c" class=""></div>`;
    const out = replacePlaceholder(html, 'a.b.c', 'Demo1');

    expect(out).toBe(`<div class=""><div data-repl-output><Demo1 /></div></div>`);
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

    expect(out).toBe(`<div><div data-repl-output><Demo1 /></div></div>`);
  });
});

describe('buildGmdModule', () => {
  test('needs no babel when the document has no live demos', () => {
    const out = buildGmdModule({ prose: `<h1>Hello</h1>`, demos: [] });

    expect(out).toBe(`<template><h1>Hello</h1></template>\n`);
  });

  test('reports a missing babel rather than failing deep in the merge', () => {
    expect(() =>
      buildGmdModule({
        prose: `<div id="a"></div>`,
        demos: [{ name: 'Demo1', placeholderId: 'a', source: `export default 1;` }],
      })
    ).toThrow(/needs babel/);
  });

  test('inlines a demo, hoists its imports, and references it from the prose', () => {
    const source = [
      `import Component from '@glimmer/component';`,
      `class Greeting extends Component {}`,
      `export default Greeting;`,
    ].join('\n');

    const out = build(`<h1>Hello</h1><div id="repl_1" class="demo"></div>`, [
      { name: 'Demo1', placeholderId: 'repl_1', source },
    ]);

    /** the demo's import keeps its original local name */
    expect(out).toContain(`import Component from '@glimmer/component';`);
    expect(out).toMatch(/const Demo1 = \(\(\) => \{[\s\S]*\}\)\(\);/);
    expect(out).toContain(
      `<template><h1>Hello</h1><div class="demo"><div data-repl-output><Demo1 /></div></div></template>`
    );
  });

  test('two demos declaring the same top-level name do not collide', () => {
    const make = (body: string) => [`const value = ${body};`, `export default value;`].join('\n');

    const out = build(`<div id="a"></div><div id="b"></div>`, [
      { name: 'Demo1', placeholderId: 'a', source: make('1') },
      { name: 'Demo2', placeholderId: 'b', source: make('2') },
    ]);

    expect(out.indexOf('const Demo1 ')).toBeLessThan(out.indexOf('const Demo2 '));
    /** both demos still produce their own value */
    expect(out).toContain('1');
    expect(out).toContain('2');
  });

  test('a demo import that collides with another module keeps both bindings', () => {
    const out = build(`<div id="a"></div><div id="b"></div>`, [
      {
        name: 'Demo1',
        placeholderId: 'a',
        source: [`import { on } from '@ember/modifier';`, `export default on;`].join('\n'),
      },
      {
        name: 'Demo2',
        placeholderId: 'b',
        source: [`import { on } from 'somewhere-else';`, `export default on;`].join('\n'),
      },
    ]);

    expect(out).toContain(`from '@ember/modifier';`);
    expect(out).toContain(`from 'somewhere-else';`);
    /** the second `on` is renamed rather than merged into the first */
    expect(out).toMatch(/on as on\$1|on\$1/);
  });

  test('the same binding imported by two demos is emitted once', () => {
    const source = [`import { on } from '@ember/modifier';`, `export default on;`].join('\n');

    const out = build(`<div id="a"></div><div id="b"></div>`, [
      { name: 'Demo1', placeholderId: 'a', source },
      { name: 'Demo2', placeholderId: 'b', source },
    ]);

    expect(out.match(/from '@ember\/modifier';/g)?.length).toBe(1);
  });

  test('a demo that quotes module syntax in a template literal is left intact', () => {
    const source = [
      `import Component from '@glimmer/component';`,
      'const SAMPLE = `import { tracked } from "@glimmer/tracking";',
      ``,
      `export default class Hello extends Component {}`,
      '`;',
      `export default SAMPLE;`,
    ].join('\n');

    const out = build(`<div id="a"></div>`, [{ name: 'Demo1', placeholderId: 'a', source }]);

    /** The quoted module keeps its own import and its own export default, with no change to the text */
    expect(out).toContain(
      '`import { tracked } from "@glimmer/tracking";\n\nexport default class Hello extends Component {}\n`'
    );
    /** ...and only the demo's real import was hoisted */
    expect(out.match(/^import /gm)?.length).toBe(1);
  });

  test('a demo without a default export still produces a binding', () => {
    const out = build(`<div id="a"></div>`, [
      { name: 'Demo1', placeholderId: 'a', source: `const unused = 1;` },
    ]);

    expect(out).toMatch(/const Demo1 = \(\(\) => \{/);
    expect(out).not.toContain('return _demo0_default;');
  });

  test('named exports in a demo lose the export keyword but keep the declaration', () => {
    const source = [`export const helper = 1;`, `export default helper;`].join('\n');

    const out = build(`<div id="a"></div>`, [{ name: 'Demo1', placeholderId: 'a', source }]);

    expect(out).not.toMatch(/^\s*export const/m);
    expect(out).toMatch(/const _demo0_helper = 1;/);
  });

  test('a default export that is a named class stays a declaration', () => {
    const source = [
      `import Component from '@glimmer/component';`,
      `export default class Demo extends Component {`,
      `  static self = Demo;`,
      `}`,
    ].join('\n');

    const out = build(`<div id="a"></div>`, [{ name: 'Demo1', placeholderId: 'a', source }]);

    expect(out).toContain(`class _demo0_Demo extends Component {`);
    expect(out).toContain(`static self = _demo0_Demo;`);
    expect(out).toContain(`const _demo0_default = _demo0_Demo;`);
    expect(out).toContain(`return _demo0_default;`);
  });

  test('a default export that is a named function is returned', () => {
    const out = build(`<div id="a"></div>`, [
      { name: 'Demo1', placeholderId: 'a', source: `export default function demo() {}` },
    ]);

    expect(out).toContain(`function _demo0_demo() {}`);
    expect(out).toContain(`const _demo0_default = _demo0_demo;`);
    expect(out).toContain(`return _demo0_default;`);
  });

  test('a default export in an export list is returned', () => {
    const source = [`const a = 1;`, `const b = 2;`, `export { a as default, b };`].join('\n');

    const out = build(`<div id="a"></div>`, [{ name: 'Demo1', placeholderId: 'a', source }]);

    expect(out).toContain(`const _demo0_default = _demo0_a;`);
    expect(out).toContain(`return _demo0_default;`);
    expect(out).not.toMatch(/^\s*export \{/m);
  });

  test('decorators stay decorators', () => {
    const source = [
      `import { tracked } from '@glimmer/tracking';`,
      `export default class Demo {`,
      `  @tracked count = 0;`,
      `}`,
    ].join('\n');

    const out = build(`<div id="a"></div>`, [{ name: 'Demo1', placeholderId: 'a', source }]);

    expect(out).toMatch(/@tracked\s+count = 0;/);
  });

  test('an import with no bindings is kept, one time', () => {
    const source = [`import './setup.js';`, `export default 1;`].join('\n');

    const out = build(`<div id="a"></div><div id="b"></div>`, [
      { name: 'Demo1', placeholderId: 'a', source },
      { name: 'Demo2', placeholderId: 'b', source },
    ]);

    expect(out.match(/^import '\.\/setup\.js';$/gm)?.length).toBe(1);
  });

  test('an import can have the name that another demo declares', () => {
    const out = build(`<div id="a"></div><div id="b"></div>`, [
      {
        name: 'Demo1',
        placeholderId: 'a',
        source: [`const tracked = 1;`, `export default tracked;`].join('\n'),
      },
      {
        name: 'Demo2',
        placeholderId: 'b',
        source: [
          `import { tracked as t } from '@glimmer/tracking';`,
          `const tracked = 2;`,
          `export default [t, tracked];`,
        ].join('\n'),
      },
    ]);

    expect(out).toContain(`import { tracked as t } from '@glimmer/tracking';`);
    expect(out).toContain(`const _demo1_default = [t, _demo1_tracked];`);
  });

  test('an import can not take the name of a demo', () => {
    const out = build(`<div id="a"></div>`, [
      {
        name: 'Demo1',
        placeholderId: 'a',
        source: [`import Demo1 from './other.js';`, `export default Demo1;`].join('\n'),
      },
    ]);

    expect(out).toContain(`import Demo1$1 from './other.js';`);
    expect(out).toContain(`const _demo0_default = Demo1$1;`);
  });

  test('with no demos, the imports are the text that came in', () => {
    const out = buildGmdModule({
      prose: `<APIDocs />`,
      imports: `import { APIDocs } from 'kolay';`,
    });

    expect(out).toBe(`import { APIDocs } from 'kolay';\n\n<template><APIDocs /></template>\n`);
  });

  test('imports merge with the imports of the demos, and keep their names', () => {
    const out = buildGmdModule({
      babel,
      prose: `<Shadowed /><div id="a"></div>`,
      imports: [
        `import { Shadowed, on as onEvent } from 'ember-primitives';`,
        `import Thing, * as all from './thing.js';`,
        `import './setup.js';`,
      ].join('\n'),
      demos: [
        {
          name: 'Demo1',
          placeholderId: 'a',
          source: [
            `import { Shadowed } from 'ember-primitives';`,
            `import { on as onEvent } from 'somewhere-else';`,
            `export default [Shadowed, onEvent];`,
          ].join('\n'),
        },
      ],
    });

    expect(out).toContain(`import { Shadowed, on as onEvent } from 'ember-primitives';`);
    expect(out).toContain(`import * as all from './thing.js';`);
    expect(out).toContain(`import Thing from './thing.js';`);
    expect(out).toContain(`import './setup.js';`);
    /** the demo is the one that gets the new name */
    expect(out).toContain(`import { on as onEvent$1 } from 'somewhere-else';`);
    expect(out).toContain(`const _demo0_default = [Shadowed, onEvent$1];`);
    expect(out.match(/from 'ember-primitives';/g)?.length).toBe(1);
  });
});
