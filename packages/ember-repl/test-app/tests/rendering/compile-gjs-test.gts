// import { assert as debugAssert } from '@ember/debug';
// import { render, setupOnerror } from '@ember/test-helpers';
// import QUnit, { module, test } from 'qunit';
// import { setupRenderingTest } from 'ember-qunit';
//
// import { stripIndent } from 'common-tags';
// import { compile } from 'ember-repl';
//
// import type { ComponentLike } from '@glint/template';
//
// function unexpectedErrorHandler(error: unknown) {
//   console.error(error);
//   QUnit.assert.notOk(`CHECK CONSOLE: did not expect error: ${error}`);
// }
//
// module('Rendering | compile()', function (hooks) {
//   setupRenderingTest(hooks);
//
//   module('format: gjs', function () {
//     test('gjs with imports works', async function (assert) {
//       setupOnerror(() => {
//         assert.notOk('This should not error');
//       });
//
//       let snippet = stripIndent`
//         import Component from '@glimmer/component';
//         import { on } from '@ember/modifier';
//
//         const { console } = globalThis;
//
//         <template>
//           <button {{on "click" console.log}}>Click</button>
//         </template>
//       `;
//
//       let component: ComponentLike | undefined;
//
//       await compile(snippet, {
//         format: 'gjs',
//         onSuccess: (comp) => (component = comp),
//         onError: unexpectedErrorHandler,
//         onCompileStart: () => {
//           /* not used */
//         },
//       });
//
//       debugAssert(`[BUG]`, component);
//
//       await render(component);
//
//       assert.dom('button').hasText('Click');
//     });
//   });
// });
