import { assert as debugAssert } from '@ember/debug';
import { render, setupOnerror } from '@ember/test-helpers';
import QUnit, { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';

import { stripIndent } from 'common-tags';
import { compile } from 'ember-repl';
import { CACHE } from 'ember-repl/__PRIVATE__DO_NOT_USE__';
import { visit } from 'unist-util-visit';

import type { ComponentLike } from '@glint/template';
import type { PluggableList } from 'unified';
import type { Parent } from 'unist';

type UnifiedPlugin = PluggableList[0];
type Build = (plugin?: UnifiedPlugin) => Promise<void>;

function unexpectedErrorHandler(error: unknown) {
  console.error(error);
  QUnit.assert.notOk(`CHECK CONSOLE: did not expect error: ${error}`);
}

module('Rendering | compile()', function (hooks) {
  setupRenderingTest(hooks);

  module('markdown features', function () {
    test('tables', async function (assert) {
      setupOnerror(() => {
        assert.notOk('This should not error');
      });

      let snippet = stripIndent`
        | Color | Food |
        | ----  | ---- |
        | red   | apple |
        | yellow| banana |
      `;

      let component: ComponentLike | undefined;

      await compile(snippet, {
        format: 'glimdown',
        onSuccess: (comp) => (component = comp),
        onError: unexpectedErrorHandler,
        onCompileStart: () => {
          /* not used */
        },
      });

      debugAssert(`[BUG]`, component);

      await render(component);

      assert.dom('table').exists();
      assert.dom('td').containsText('red');
    });

    test('footnotes', async function (assert) {
      setupOnerror(() => {
        assert.notOk('This should not error');
      });

      let snippet = stripIndent`
        text[^note]

        [^note]: a note about a thing
      `;

      let component: ComponentLike | undefined;

      await compile(snippet, {
        format: 'glimdown',
        onSuccess: (comp) => (component = comp),
        onError: unexpectedErrorHandler,
        onCompileStart: () => {
          /* not used */
        },
      });

      debugAssert(`[BUG]`, component);

      await render(component);

      assert.dom('sup').exists();
      assert.dom('a').exists({ count: 2 }); // to and from the footnote
    });

    module('custom remark plugins', function () {
      module('demo: remove pre code', function (hooks) {
        let build: Build;
        let component: ComponentLike | undefined;

        let snippet = stripIndent`
          text

          \`\`\`js
          const two = 2;
          \`\`\`
        `;

        /**
         * Test plugin that just turns code into an
         * unformatted mess in a p tag
         */
        const uncodeSnippet: UnifiedPlugin = (/* options */) => {
          return function transformer(tree: Parameters<typeof visit>[0]) {
            visit(tree, ['code'], function (node, index, parent: Parent) {
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

        hooks.beforeEach(function (assert) {
          CACHE.clear();
          component = undefined;

          build = async function build(plugin?: UnifiedPlugin) {
            if (plugin) {
              return await compile(snippet, {
                format: 'glimdown',
                remarkPlugins: [plugin],
                onSuccess: (comp) => (component = comp),
                onError: unexpectedErrorHandler,
                onCompileStart: () => {
                  /* not used */
                },
              });
            }

            await compile(snippet, {
              format: 'glimdown',
              onSuccess: (comp) => (component = comp),
              onError: (e) => assert.notOk('did not expect error. ' + e),
              onCompileStart: () => {
                /* not used */
              },
            });
          };
        });

        // https://github.com/typed-ember/glint/issues/617
        test('baseline: without the plugin, pre renders', async function (assert) {
          debugAssert(`[BUG]`, build);
          await build();
          debugAssert(`[BUG]`, component);

          await render(component);
          assert.dom('pre').exists();
        });

        // https://github.com/typed-ember/glint/issues/617
        test('with the plugin: no pre renders', async function (assert) {
          debugAssert(`[BUG]`, build);
          await build(uncodeSnippet);
          debugAssert(`[BUG] component`, component);

          await render(component);
          // await this.pauseTest();
          assert.dom('pre').doesNotExist();
        });
      });
    });
  });

  module('passing options', function () {
    test('adding to top-level scope', async function (assert) {
      const text = `This is a local component added to topLevelScope`;
      const LocalComponent = <template>{{text}}</template>;

      setupOnerror(() => {
        assert.notOk('This should not error');
      });

      let snippet = stripIndent`
        <LocalComponent />
      `;

      let component: ComponentLike | undefined;

      await compile(snippet, {
        format: 'glimdown',
        onSuccess: (comp) => (component = comp),
        onError: unexpectedErrorHandler,
        onCompileStart: () => {
          /* not used */
        },
        topLevelScope: {
          LocalComponent,
        },
      });

      debugAssert(`[BUG]`, component);

      await render(component);

      assert.dom().hasText(text);
    });

    test('adding to top-level scope applies to rendered "hbs" codefences', async function (assert) {
      const text = `This is a local component added to topLevelScope`;
      const LocalComponent = <template>{{text}}</template>;

      setupOnerror((e) => {
        console.error(e);
        assert.notOk('This should not error');
      });

      let snippet = stripIndent`
        Using a live hbs tag is how we can syntax highlighting

        \`\`\`hbs live
        <LocalComponent />
        \`\`\`
      `;

      let component: ComponentLike | undefined;

      await compile(snippet, {
        format: 'glimdown',
        onSuccess: (comp) => (component = comp),
        onError: unexpectedErrorHandler,
        onCompileStart: () => {
          /* not used */
        },
        topLevelScope: {
          LocalComponent,
        },
      });

      debugAssert(`[BUG]`, component);

      await render(component);

      assert.dom().containsText(text);
    });

    test('adding a remark plugin', async function (assert) {
      setupOnerror((e) => {
        console.error(e);
        assert.notOk('This should not error');
      });

      let snippet = '# Hello';

      let component: ComponentLike | undefined;

      await compile(snippet, {
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

      debugAssert(`[BUG]`, component);

      await render(component);

      assert.dom('h2').containsText('Hello');
    });


    test('plugins can add code snippets', async function (assert) {
      setupOnerror((e) => {
        console.error(e);
        assert.notOk('This should not error');
      });

      let snippet = `# Hello

\`\`\`gjs live
<template>not a greeting</template>
\`\`\`

<Greeting />
`;

      let component: ComponentLike | undefined;

      await compile(snippet, {
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
                  `
                  // TODO: where is the type for a code node?
                } as any
              });
            };
          },
        ],
      });

      debugAssert(`[BUG]`, component);

      await render(component);

      assert.dom('p').containsText('a greeting');
      });

    test('adding a rehype plugin', async function (assert) {
      setupOnerror((e) => {
        console.error(e);
        assert.notOk('This should not error');
      });

      let snippet = '# Hello';

      let component: ComponentLike | undefined;

      await compile(snippet, {
        format: 'glimdown',
        onSuccess: (comp) => (component = comp),
        onError: unexpectedErrorHandler,
        onCompileStart: () => {
          /* not used */
        },
        rehypePlugins: [
          function noH1(/* options */) {
            return (tree) => {
              return visit(tree, ['element'], function (node) {
                if (!('tagName' in node)) return;

                if (node.tagName === 'h1') {
                  node.tagName = 'h2';
                }

                return 'skip';
              });
            };
          },
        ],
      });

      debugAssert(`[BUG]`, component);

      await render(component);

      assert.dom('h2').containsText('Hello');
    });
  });
});
