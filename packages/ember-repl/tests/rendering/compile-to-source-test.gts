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

    assert.strictEqual(typeof source, 'string');
    assert.true(source.includes('export default'), 'the source is a module');
    assert.false(
      source.includes('createTemplateFactory'),
      'the template is not in the wire format of one ember-source version'
    );
    assert.false(
      source.includes('decorator-transforms'),
      'the decorators are left for the host build'
    );

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

    assert.false(source.includes(': string'), 'the types are gone');

    await render(await build(compiler, source));

    assert.dom('output').hasText('hello');
  });

  test('hbs', async function (assert) {
    const compiler = getCompiler(this);

    const { source } = await compiler.compileToSource(
      'hbs',
      `<output>hello</output>`
    );

    assert.true(source.includes(`from '@ember/template-compiler'`));

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

    assert.strictEqual(
      source.match(/^import /gm)?.length,
      new Set(source.match(/^import .*$/gm)).size,
      'no import is repeated'
    );

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
