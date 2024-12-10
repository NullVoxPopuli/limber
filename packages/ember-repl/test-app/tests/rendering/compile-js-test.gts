// import { click, render } from '@ember/test-helpers';
// import { module, test } from 'qunit';
// import { setupRenderingTest } from 'ember-qunit';
//
// import { compileJS } from 'ember-repl/formats/gjs';
// // import this so we don't tree-shake it away
// import ExampleComponent from 'test-app/components/example-component';
//
// import { Await } from '../helpers/await';
//
// module('compileJS()', function (hooks) {
//   setupRenderingTest(hooks);
//
//   test('it works', async function (assert) {
//     let compile = async () => {
//       let template = `
//         import Component from '@glimmer/component';
//         import { tracked } from '@glimmer/tracking';
//         import { on } from '@ember/modifier';
//
//         export default class MyComponent extends Component {
//           @tracked value = 0;
//
//           increment = () => this.value++;
//
//           <template>
//             <output>{{this.value}}</output>
//             <button {{on "click" this.increment}}>+1</button>
//           </template>
//         }
//       `;
//
//       let { component, name, error } = await compileJS(template);
//
//       assert.notOk(error);
//       assert.ok(name);
//
//       return component;
//     };
//
//     await render(
//       <template>
//         {{#let (compile) as |CustomComponent|}}
//           <Await @promise={{CustomComponent}} />
//         {{/let}}
//       </template>
//     );
//
//     assert.dom('output').exists();
//     assert.dom('output').hasText('0');
//
//     await click('button');
//     assert.dom('output').hasText('1');
//
//     await click('button');
//     assert.dom('output').hasText('2');
//   });
//
//   test('can import components available to the app', async function (assert) {
//     assert.ok(ExampleComponent);
//
//     let compile = async () => {
//       let template = `
//         import Component from '@glimmer/component';
//         import { tracked } from '@glimmer/tracking';
//         import { on } from '@ember/modifier';
//
//         import Example from 'test-app/components/example-component';
//
//         <template>
//           <Example />
//         </template>
//       `;
//
//       let { component, name, error } = await compileJS(template);
//
//       assert.notOk(error);
//       assert.ok(name);
//
//       return component;
//     };
//
//     await render(
//       <template>
//         {{#let (compile) as |CustomComponent|}}
//           <Await @promise={{CustomComponent}} />
//         {{/let}}
//       </template>
//     );
//
//     assert.dom().hasText('!!Example!!');
//   });
//
//   test('extra modules may be passed, explicitly', async function (assert) {
//     const AComponent = <template>Custom extra module</template>;
//
//     let compile = async () => {
//       let template = `
//         import Component from '@glimmer/component';
//         import { tracked } from '@glimmer/tracking';
//         import { on } from '@ember/modifier';
//
//         import AComponent from 'my-silly-import-path/a-component';
//
//         <template>
//           <AComponent />
//         </template>
//       `;
//
//       let { component, name, error } = await compileJS(template, {
//         'my-silly-import-path/a-component': AComponent,
//       });
//
//       assert.notOk(error);
//       assert.ok(name);
//
//       return component;
//     };
//
//     await render(
//       <template>
//         {{#let (compile) as |CustomComponent|}}
//           <Await @promise={{CustomComponent}} />
//         {{/let}}
//       </template>
//     );
//
//     assert.dom().hasText('Custom extra module');
//   });
// });
