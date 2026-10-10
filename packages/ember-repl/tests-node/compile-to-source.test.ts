import { getCompiler } from 'ember-repl';
import { describe, expect, test } from 'vitest';

/**
 * A build tool has no application, so it has no owner.
 * Any object can hold the compiler.
 */
function compiler() {
  return getCompiler({});
}

describe('compileToSource in node', () => {
  test('hbs', async () => {
    const { source } = await compiler().compileToSource(
      'hbs',
      `<output>hello</output>`
    );

    expect(source).toMatchInlineSnapshot(`
      "import { template } from '@ember/template-compiler';

      export default template("<output>hello</output>", { scope: () => ({}) });
      "
    `);
  });

  test('gjs', async () => {
    const { source } = await compiler().compileToSource(
      'gjs',
      [
        `import { on } from '@ember/modifier';`,
        ``,
        `const hi = () => {};`,
        ``,
        `<template><button {{on "click" hi}}>hi</button></template>`,
      ].join('\n')
    );

    expect(source).toMatchInlineSnapshot(`
      "import { on } from '@ember/modifier';
      import { precompileTemplate } from "@ember/template-compilation";
      import { setComponentTemplate } from "@ember/component";
      import templateOnly from "@ember/component/template-only";
      const hi = () => {};
      export default setComponentTemplate(precompileTemplate("<button {{on \\"click\\" hi}}>hi</button>", {
        strictMode: true,
        scope: () => ({
          on,
          hi
        })
      }), templateOnly());"
    `);
  });

  test('markdown with demos', async () => {
    const { source } = await compiler().compileToSource(
      'gmd',
      [
        '# Title',
        '',
        '```gjs live',
        `const value = 'first';`,
        '',
        '<template>{{value}}</template>',
        '```',
        '',
        '```hbs live',
        '<output>second</output>',
        '```',
      ].join('\n')
    );

    expect(source).toMatchInlineSnapshot(`
      "import { template } from '@ember/template-compiler';
      import { precompileTemplate } from '@ember/template-compilation';
      import { setComponentTemplate } from '@ember/component';
      import templateOnly from '@ember/component/template-only';

      const Demo1 = (() => {
      const _demo0_value = 'first';
      const _demo0_default = setComponentTemplate(precompileTemplate("{{value}}", {
        strictMode: true,
        scope: () => ({
          value: _demo0_value
        })
      }), templateOnly());

      return _demo0_default;
      })();

      const Demo2 = (() => {
      const _demo1_default = template("<output>second</output>", {
        scope: () => ({})
      });

      return _demo1_default;
      })();

      const _component = template("<h1 id=\\"title\\">Title</h1>\\n<div class=\\"repl-sdk__demo\\"><div data-repl-output><Demo1 /></div></div>\\n<div class=\\"repl-sdk__demo\\"><div data-repl-output><Demo2 /></div></div>", {
        scope: () => ({ Demo1, Demo2 }),
      });
      export default _component;
      "
    `);
  });
});
