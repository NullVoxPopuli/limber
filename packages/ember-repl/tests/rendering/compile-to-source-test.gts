import { assert as debugAssert } from '@ember/debug';
import { render, setupOnerror } from '@ember/test-helpers';
import QUnit, { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';

import { stripIndent } from 'common-tags';
import { compile, getCompiler } from 'ember-repl';

import { setupCompiler } from 'ember-repl/test-support';

import type { ComponentLike } from '@glint/template';

function unexpectedErrorHandler(error: unknown) {
  console.error(error);
  QUnit.assert.notOk(`CHECK CONSOLE: did not expect error: ${String(error)}`);
}

/**
 * The emitted source is a plain JS module, which is also valid gjs.
 * So the gjs compiler stands in for the build of a host app.
 */
async function build(compiler: ReturnType<typeof getCompiler>, source: string) {
  let component: ComponentLike | undefined;

  const state = compile(compiler, source, {
    format: 'gjs',
    onSuccess: (comp) => (component = comp),
    onError: unexpectedErrorHandler,
  });

  await state.promise;

  debugAssert(`[BUG]`, component);

  return component;
}

/**
 * The exact source for each format.
 * A change here is a change to what the build of another app gets.
 */
const EXPECTED = {
  gjs: String.raw`
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { precompileTemplate } from "@ember/template-compilation";
import { setComponentTemplate } from "@ember/component";
const greeting = 'hello';
export default class Demo extends Component {
  @tracked
  name = 'there';
  static {
    setComponentTemplate(precompileTemplate("<output>{{greeting}} {{this.name}}</output>", {
      strictMode: true,
      scope: () => ({
        greeting
      })
    }), this);
  }
}
`,
  gts: String.raw`
import { precompileTemplate } from "@ember/template-compilation";
import { setComponentTemplate } from "@ember/component";
import templateOnly from "@ember/component/template-only";
const greeting = 'hello';
export default setComponentTemplate(precompileTemplate("<output>{{greeting}}</output>", {
  strictMode: true,
  scope: () => ({
    greeting
  })
}), templateOnly());
`,
  hbs: String.raw`
import { precompileTemplate } from "@ember/template-compilation";
import { setComponentTemplate } from "@ember/component";
import templateOnly from "@ember/component/template-only";
export default setComponentTemplate(precompileTemplate("<output>hello</output>", {
  strictMode: true
}), templateOnly());
`,
  markdown: String.raw`
import { precompileTemplate } from "@ember/template-compilation";
import { setComponentTemplate } from "@ember/component";
import templateOnly from "@ember/component/template-only";
export default setComponentTemplate(precompileTemplate("<h1 id=\"title\">Title</h1>\n<ul>\n<li>one</li>\n<li>two</li>\n</ul>", {
  strictMode: true
}), templateOnly());
`,
  demos: String.raw`
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { precompileTemplate } from '@ember/template-compilation';
import { setComponentTemplate } from '@ember/component';
import templateOnly from '@ember/component/template-only';
const Demo1 = (() => {
  const _demo0_value = 'first';
  class _demo0_Demo extends Component {
    @tracked
    suffix = "!";
    static {
      setComponentTemplate(precompileTemplate("<output class=\"one\">{{value}}{{this.suffix}}</output>", {
        strictMode: true,
        scope: () => ({
          value: _demo0_value
        })
      }), this);
    }
  }
  const _demo0_default = _demo0_Demo;
  return _demo0_default;
})();
const Demo2 = (() => {
  const _demo1_value = 'second';
  const _demo1_default = setComponentTemplate(precompileTemplate("<output class=\"two\">{{value}}</output>", {
    strictMode: true,
    scope: () => ({
      value: _demo1_value
    })
  }), templateOnly());
  return _demo1_default;
})();
const Demo3 = (() => {
  const _demo2_default = setComponentTemplate(precompileTemplate("<output class=\"three\">third</output>", {
    strictMode: true
  }), templateOnly());
  return _demo2_default;
})();
export default setComponentTemplate(precompileTemplate("<h1 id=\"title\">Title</h1>\n<div class=\"repl-sdk__demo\"><div data-repl-output><Demo1 /></div></div>\n<div class=\"repl-sdk__demo\"><div data-repl-output><Demo2 /></div></div>\n<div class=\"repl-sdk__demo\"><div data-repl-output><Demo3 /></div></div>\n<div class=\"repl-sdk__snippet\" data-repl-output><pre><code class=\"language-gjs\">const notLive = true;\n</code></pre></div>", {
  strictMode: true,
  scope: () => ({
    Demo1,
    Demo2,
    Demo3
  })
}), templateOnly());
`,
};

/**
 * @param source the result of compileToSource
 * @param expected an entry of EXPECTED
 */
function assertSource(source: string, expected: string) {
  QUnit.assert.strictEqual(source.trim(), expected.trim(), 'the source');
}

module('Rendering | compileToSource()', function (hooks) {
  setupRenderingTest(hooks);
  setupCompiler(hooks);

  hooks.beforeEach(function () {
    setupOnerror((e) => {
      QUnit.assert.notOk(e, 'This should not error');
    });
  });

  test('gjs', async function (assert) {
    const compiler = getCompiler(this);

    const { source } = await compiler.compileToSource(
      'gjs',
      stripIndent`
        import Component from '@glimmer/component';
        import { tracked } from '@glimmer/tracking';

        const greeting = 'hello';

        export default class Demo extends Component {
          @tracked name = 'there';

          <template>
            <output>{{greeting}} {{this.name}}</output>
          </template>
        }
      `
    );

    assertSource(source, EXPECTED.gjs);

    await render(await build(compiler, source));

    assert.dom('output').hasText('hello there');
  });

  test('gts', async function (assert) {
    const compiler = getCompiler(this);

    const { source } = await compiler.compileToSource(
      'gts',
      stripIndent`
        const greeting: string = 'hello';

        <template>
          <output>{{greeting}}</output>
        </template>
      `
    );

    assertSource(source, EXPECTED.gts);

    await render(await build(compiler, source));

    assert.dom('output').hasText('hello');
  });

  test('hbs', async function (assert) {
    const compiler = getCompiler(this);

    const { source } = await compiler.compileToSource(
      'hbs',
      `<output>hello</output>`
    );

    assertSource(source, EXPECTED.hbs);

    await render(await build(compiler, source));

    assert.dom('output').hasText('hello');
  });

  test('markdown without demos', async function (assert) {
    const compiler = getCompiler(this);

    const { source } = await compiler.compileToSource(
      'gmd',
      stripIndent`
        # Title

        - one
        - two
      `
    );

    assertSource(source, EXPECTED.markdown);

    await render(await build(compiler, source));

    assert.dom('h1').hasText('Title');
    assert.dom('li').exists({ count: 2 });
  });

  test('markdown with demos that use the same names', async function (assert) {
    const compiler = getCompiler(this);

    const { source } = await compiler.compileToSource(
      'gmd',
      [
        '# Title',
        '',
        '```gjs live',
        `import Component from '@glimmer/component';`,
        `import { tracked } from '@glimmer/tracking';`,
        '',
        `const value = 'first';`,
        '',
        'export default class Demo extends Component {',
        '  @tracked suffix = "!";',
        '',
        '  <template>',
        '    <output class="one">{{value}}{{this.suffix}}</output>',
        '  </template>',
        '}',
        '```',
        '',
        '```gjs live',
        `const value = 'second';`,
        '',
        '<template>',
        '  <output class="two">{{value}}</output>',
        '</template>',
        '```',
        '',
        '```hbs live',
        '<output class="three">third</output>',
        '```',
        '',
        '```gjs',
        'const notLive = true;',
        '```',
      ].join('\n')
    );

    assertSource(source, EXPECTED.demos);

    await render(await build(compiler, source));

    assert.dom('h1').hasText('Title');
    assert.dom('output.one').hasText('first!');
    assert.dom('output.two').hasText('second');
    assert.dom('output.three').hasText('third');
    assert
      .dom('[data-repl-output] output')
      .exists({ count: 3 }, 'each demo is in the same wrapper as at runtime');
    assert.dom('pre code').includesText('notLive');
  });

  test('a literal {{ stays a literal', async function (assert) {
    const compiler = getCompiler(this);

    const { source } = await compiler.compileToSource(
      'gmd',
      [
        '```gjs',
        '{{#if sample}}not a block{{/if}}',
        '```',
        '',
        '```gjs live',
        '<template><output>\\{{literal}}</output></template>',
        '```',
      ].join('\n')
    );

    await render(await build(compiler, source));

    assert.dom('output').hasText('{{literal}}');
    assert.dom('pre code').hasText('{{#if sample}}not a block{{/if}}');
  });

  test('a format with no source form rejects', async function (assert) {
    setupOnerror(() => {});

    const compiler = getCompiler(this);

    await assert.rejects(
      compiler.compileToSource('md', `# Title`),
      /'md' can not compile to source/
    );
  });

  test('errors reach the caller and the messages', async function (assert) {
    setupOnerror(() => {});

    const compiler = getCompiler(this);

    await assert.rejects(compiler.compileToSource('gjs', `const isBroken = ;`));

    assert.true(
      compiler.messages.some((message) => message.type === 'error'),
      'the error is in the messages'
    );
  });
});
