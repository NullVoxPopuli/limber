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
      "import { precompileTemplate } from "@ember/template-compilation";
      import { setComponentTemplate } from "@ember/component";
      import templateOnly from "@ember/component/template-only";
      export default setComponentTemplate(precompileTemplate("<output>hello</output>", {
        strictMode: true
      }), templateOnly());"
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
      "import { precompileTemplate } from '@ember/template-compilation';
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
        const _demo1_default = setComponentTemplate(precompileTemplate("<output>second</output>", {
          strictMode: true
        }), templateOnly());
        return _demo1_default;
      })();
      export default setComponentTemplate(precompileTemplate("<h1 id=\\"title\\">Title</h1>\\n<div class=\\"repl-sdk__demo\\"><div data-repl-output><Demo1 /></div></div>\\n<div class=\\"repl-sdk__demo\\"><div data-repl-output><Demo2 /></div></div>", {
        strictMode: true,
        scope: () => ({
          Demo1,
          Demo2
        })
      }), templateOnly());"
    `);
  });

  test('a literal {{ stays a literal', async () => {
    const { source } = await compiler().compileToSource(
      'gmd',
      [
        '```gjs',
        '{{#if sample}}not a block{{/if}}',
        '```',
        '',
        '```gjs live',
        '<template><code>\\{{literal}}</code></template>',
        '```',
      ].join('\n')
    );

    expect(source).toContain(String.raw`<code>\\{{literal}}</code>`);
    expect(source).toContain(String.raw`\\{{#if sample}}not a block\\{{/if}}`);
  });
});
