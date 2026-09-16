import { assert as debugAssert } from '@ember/debug';
import { click, render, settled, setupOnerror } from '@ember/test-helpers';
import QUnit, { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';

import { stripIndent } from 'common-tags';
import { compile, getCompiler } from 'ember-repl';

import { setupCompiler } from 'ember-repl/test-support';

import { Await } from '../helpers/await.gts';

import type { ComponentLike } from '@glint/template';

function unexpectedErrorHandler(error: unknown) {
  console.error(error);
  QUnit.assert.notOk(`CHECK CONSOLE: did not expect error: ${String(error)}`);
}

module('Rendering | compile()', function (hooks) {
  setupRenderingTest(hooks);

  module('format: gts', function (hooks) {
    setupCompiler(hooks);

    test('types are stripped, type-only imports are dropped', async function (assert) {
      setupOnerror((e) => {
        assert.notOk(e, 'This should not error');
      });

      const compiler = getCompiler(this);

      const snippet = stripIndent`
        import Component from '@glimmer/component';
        import { on } from '@ember/modifier';

        import type { TOC } from '@ember/component/template-only';

        const { console } = globalThis;

        const Label: TOC<{ Args: { text: string } }> = <template>
          <span>{{@text}}</span>
        </template>;

        interface Signature {
          Args: { greeting?: string };
        }

        export default class Demo extends Component<Signature> {
          declare unused: string;

          get greeting(): string {
            return this.args.greeting ?? 'Click';
          }

          <template>
            <button {{on "click" console.log}}><Label @text={{this.greeting}} /></button>
          </template>
        }
      `;

      let component: ComponentLike | undefined;

      const state = compile(compiler, snippet, {
        format: 'gts',
        onSuccess: (comp) => (component = comp),
        onError: unexpectedErrorHandler,
      });

      await state.promise;

      debugAssert(`[BUG]`, component);

      await render(component);

      assert.dom('button').hasText('Click');
    });

    test('decorators on typed fields work', async function (assert) {
      const compile = async () => {
        const template = `
        import Component from '@glimmer/component';
        import { tracked } from '@glimmer/tracking';
        import { on } from '@ember/modifier';

        export default class MyComponent extends Component {
          @tracked value: number = 0;

          increment = (): void => {
            this.value++;
          };

          <template>
            <output>{{this.value}}</output>
            <button {{on "click" this.increment}}>+1</button>
          </template>
        }
      `;
        const compiler = getCompiler(this);

        const { component, name, error } = await compiler.compile(
          'gts',
          template
        );

        assert.notOk(error);
        assert.ok(name);

        return component;
      };

      void render(
        <template>
          {{#let (compile) as |promise|}}
            <Await @promise={{promise}} />
          {{/let}}
        </template>
      );

      await settled();

      assert.dom('output').hasText('0', 'output has text: 0');

      await click('button');
      assert.dom('output').hasText('1', 'output has text: 1');
    });

    test('type errors are not checked, only syntax errors are reported', async function (assert) {
      const compiler = getCompiler(this);

      const { component, error } = await compiler.compile(
        'gts',
        `const x: number = 'not a number';\n<template>{{x}}</template>`
      );

      assert.notOk(error, 'a type mismatch still compiles');

      debugAssert(`[BUG]`, component);

      await render(component);

      assert.dom().hasText('not a number');
    });
  });
});
