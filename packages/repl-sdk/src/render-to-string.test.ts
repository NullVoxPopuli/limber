import babel from '@babel/standalone';
import { describe, expect, test } from 'vitest';

import { buildGmdModule, replacePlaceholder } from './render-to-string.js';

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
  test('emits a build-time template import and an empty scope with no demos', () => {
    const out = build(`<h1>Hello</h1>`, []);

    expect(out).toContain(`import { template } from '@ember/template-compiler';`);
    expect(out).toMatch(/scope: \(\) => \(\{\}\)/);
    expect(out).not.toMatch(/const Demo\d+ = /);
    expect(out).toContain(`export default _component;`);
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

    // the demo's import keeps its original local name
    expect(out).toContain(`import Component from '@glimmer/component';`);
    expect(out).toMatch(/const Demo1 = \(\(\) => \{[\s\S]*\}\)\(\);/);
    expect(out).toContain(`<div class=\\"demo\\"><div data-repl-output><Demo1 /></div></div>`);
    expect(out).not.toContain(`<div id=\\"repl_1\\"`);
    expect(out).toMatch(/scope: \(\) => \(\{ Demo1 \}\)/);
  });

  test('two demos declaring the same top-level name do not collide', () => {
    const make = (body: string) => [`const value = ${body};`, `export default value;`].join('\n');

    const out = build(`<div id="a"></div><div id="b"></div>`, [
      { name: 'Demo1', placeholderId: 'a', source: make('1') },
      { name: 'Demo2', placeholderId: 'b', source: make('2') },
    ]);

    expect(out).toMatch(/scope: \(\) => \(\{ Demo1, Demo2 \}\)/);
    expect(out.indexOf('const Demo1 ')).toBeLessThan(out.indexOf('const Demo2 '));
    // both demos still produce their own value
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
    // the second `on` is renamed rather than merged into the first
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

    // The quoted module keeps its own import and its own export default
    expect(out).toContain(`import { tracked } from "@glimmer/tracking";`);
    expect(out).toContain(`export default class Hello extends Component {}`);
    // ...and only the demo's real import was hoisted, alongside `template`
    expect(out.match(/^import /gm)?.length).toBe(2);
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
});
