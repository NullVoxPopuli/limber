import { assert as debugAssert } from '@ember/debug';
import { render, settled, setupOnerror } from '@ember/test-helpers';
import QUnit, { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';

import { stripIndent } from 'common-tags';
import { compile, getCompiler } from 'ember-repl';
import { visit } from 'unist-util-visit';

import { setupCompiler } from 'ember-repl/test-support';

import type { ComponentLike } from '@glint/template';
import type { Root } from 'mdast';
import type { Plugin } from 'unified';
import type { Parent } from 'unist';

function unexpectedErrorHandler(error: unknown) {
  console.error(error);
  QUnit.assert.notOk(`CHECK CONSOLE: did not expect error: ${String(error)}`);
}

module('Rendering | compile()', function (hooks) {
  setupRenderingTest(hooks);

  module('format: md', function () {
    test('it works', async function (assert) {
      setupOnerror((e) => {
        assert.notOk(e, 'This should not error');
      });

      const snippet = stripIndent`
        # hello there

        - one
        - two
      `;

      let component: ComponentLike | undefined;
      const compiler = getCompiler(this);
      const state = compile(compiler, snippet, {
        format: 'md',
        onSuccess: (comp) => (component = comp),
        onError: unexpectedErrorHandler,
        onCompileStart: () => {
          /* not used */
        },
      });

      await state.promise;

      debugAssert(`[BUG]`, component);

      await render(component);

      assert.dom('h1').exists();
      assert.dom('li').exists({ count: 2 });
    });
  });

  module('markdown features', function () {
    module('custom remark plugins', function () {
      module('demo: remove pre code', function () {
        const snippet = stripIndent`
          text

          \`\`\`js
          const two = 2;
          \`\`\`
        `;

        async function makeComponent(
          context: object,
          onComponent: (comp: ComponentLike) => void,
          options: Partial<Parameters<typeof compile>[2]> = {}
        ) {
          const compiler = getCompiler(context);

          const state = compile(compiler, snippet, {
            format: 'glimdown',
            onSuccess: onComponent,
            onError: unexpectedErrorHandler,
            onCompileStart: () => {
              /* not used */
            },
            ...options,
          });

          await state.promise;

          await settled();
        }

        // https://github.com/typed-ember/glint/issues/617
        test('baseline: without the plugin, pre renders', async function (assert) {
          let component: ComponentLike | undefined;

          await makeComponent(this, (comp) => (component = comp));
          debugAssert(`[BUG]`, component);

          await render(component);
          assert.dom('pre').exists();
        });

        const removePre: Plugin<[], Root> =
          /**
           * Test plugin that just turns code into an
           * unformatted mess in a p tag
           */
          (/* options */) => {
            return function transformer(tree: Parameters<typeof visit>[0]) {
              visit(tree, 'code', function (node, index, parent: Parent) {
                if (!parent) return;
                if (undefined === index) return;

                parent.children[index] = {
                  type: 'html',
                  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                  // @ts-ignore
                  value: `<p>${node.value}</p>`,
                };
              });
            };
          };

        module('with the plugin (globally configured)', function (hooks) {
          setupCompiler(hooks, {
            options: {
              gmd: {
                remarkPlugins: [removePre],
              },
            },
          });

          // https://github.com/typed-ember/glint/issues/617
          test('no pre renders', async function (assert) {
            let component: ComponentLike | undefined;

            await makeComponent(this, (comp) => (component = comp));
            debugAssert(`[BUG] component`, component);

            await render(component);
            // await this.pauseTest();
            assert.dom('pre').doesNotExist();
          });
        });

        module('with the plugin (configured for just this render)', function () {
          // https://github.com/typed-ember/glint/issues/617
          test('no pre renders', async function (assert) {
            let component: ComponentLike | undefined;

            await makeComponent(this, (comp) => (component = comp), {
              remarkPlugins: [removePre],
            });
            debugAssert(`[BUG] component`, component);

            await render(component);
            // await this.pauseTest();
            assert.dom('pre').doesNotExist();
          });
        });
      });
    });
  });

  module('passing options', function () {
    test('adding to top-level scope', async function (assert) {
      const text = `This is a local component added to scope`;
      const LocalComponent = <template>{{text}}</template>;

      setupOnerror(() => {
        assert.notOk('This should not error');
      });

      const snippet = stripIndent`
        <LocalComponent />
      `;

      let component: ComponentLike | undefined;

      const compiler = getCompiler(this);

      const state = compile(compiler, snippet, {
        format: 'glimdown',
        onSuccess: (comp) => (component = comp),
        onError: unexpectedErrorHandler,
        onCompileStart: () => {
          /* not used */
        },
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        scope: {
          LocalComponent,
        },
      });

      await state.promise;

      debugAssert(`[BUG]`, component);

      await render(component);

      assert.dom().hasText(text);
    });

    test('adding to top-level scope applies to rendered "hbs" codefences', async function (assert) {
      const text = `This is a local component added to scope`;
      const LocalComponent = <template>{{text}}</template>;

      setupOnerror((e) => {
        console.error(e);
        assert.notOk('This should not error');
      });

      const snippet = stripIndent`
        Using a live hbs tag is how we can syntax highlighting

        \`\`\`hbs live
        <LocalComponent />
        \`\`\`
      `;

      let component: ComponentLike | undefined;

      const compiler = getCompiler(this);

      const state = compile(compiler, snippet, {
        format: 'glimdown',
        onSuccess: (comp) => (component = comp),
        onError: unexpectedErrorHandler,
        onCompileStart: () => {
          /* not used */
        },
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        scope: {
          LocalComponent,
        },
      });

      await state.promise;

      debugAssert(`[BUG]`, component);

      await render(component);

      assert.dom().containsText(text);
    });

    test('adding a remark plugin', async function (assert) {
      setupOnerror((e) => {
        console.error(e);
        assert.notOk('This should not error');
      });

      const snippet = '# Hello';

      let component: ComponentLike | undefined;

      const compiler = getCompiler(this);

      const state = compile(compiler, snippet, {
        format: 'glimdown',
        onSuccess: (comp) => (component = comp),
        onError: unexpectedErrorHandler,
        onCompileStart: () => {
          /* not used */
        },

        remarkPlugins: [
          function noH1(/* options */) {
            return (tree: Parameters<typeof visit>[0]) => {
              visit(tree, ['heading'], function (node) {
                if (!('depth' in node)) return;

                if (node.depth === 1) {
                  node.depth = 2;
                }

                return 'skip';
              });
            };
          },
        ],
      });

      await state.promise;

      debugAssert(`[BUG]`, component);

      await render(component);

      assert.dom('h2').containsText('Hello');
    });

    test('plugins can add code snippets', async function (assert) {
      setupOnerror((e) => {
        console.error(e);
        assert.notOk('This should not error');
      });

      const snippet = `# Hello

\`\`\`gjs live
<template>not a greeting</template>
\`\`\`

<Greeting />
`;

      let component: ComponentLike | undefined;

      const compiler = getCompiler(this);

      const state = compile(compiler, snippet, {
        format: 'glimdown',
        onSuccess: (comp) => (component = comp),
        onError: unexpectedErrorHandler,
        onCompileStart: () => {
          /* not used */
        },

        remarkPlugins: [
          function codeSwapper(/* options */) {
            return (tree: Parameters<typeof visit>[0]) => {
              visit(tree, ['html'], function (node, index, parent: Parent) {
                if (!parent) return;
                if (undefined === index) return;
                if (!('value' in node)) return;
                if (node.value !== '<Greeting />') return;

                parent.children[index] = {
                  type: 'code',
                  lang: 'gjs',
                  meta: 'live',
                  value: `
                    <template><p class="greeting">a greeting</p></template>
                  `,
                  // where is the type for a code node?
                } as any;
              });
            };
          },
        ],
      });

      await state.promise;

      debugAssert(`[BUG]`, component);

      await render(component);

      assert.dom('p').containsText('a greeting');
    });

    test('adding a rehype plugin', async function (assert) {
      setupOnerror((e) => {
        console.error(e);
        assert.notOk('This should not error');
      });

      const snippet = '# Hello';

      let component: ComponentLike | undefined;

      const compiler = getCompiler(this);

      const state = compile(compiler, snippet, {
        format: 'glimdown',
        onSuccess: (comp) => (component = comp),
        onError: unexpectedErrorHandler,
        onCompileStart: () => {
          /* not used */
        },
        rehypePlugins: [
          function noH1(/* options */) {
            return (tree: Root) => {
              return visit(tree, ['element'], function (node) {
                if (!('tagName' in node)) return;

                if (node.tagName === 'h1') {
                  node.tagName = 'h2';
                }

                return 'skip';
              });
            };
          } as Plugin<[], Root>,
        ],
      });

      await state.promise;

      debugAssert(`[BUG]`, component);

      await render(component);

      assert.dom('h2').containsText('Hello');
    });
  });
});
