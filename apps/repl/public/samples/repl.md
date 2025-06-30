# Build your own REPL

This app is powered by the [ember-repl](https://github.com/NullVoxPopuli/ember-repl)
package, which bundles the template compiler, \`@babel/standalone\`, and the
ember/glimmer dev dependencies.
These are dynamically imported, so if your app does not need these dependencies on boot,
your app's time-to-interactive will be unaffected.

### Usage of `ember-repl` may look like this

```gjs live
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { on } from '@ember/modifier';
import { Compiled } from 'ember-repl';

const STARTING_CODE = `import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { on } from '@ember/modifier';

export default class HelloWorld extends Component {
  @tracked count = 0;

  increment = () => this.count += 1;

  <template>
    <p>You have clicked the button {{this.count}} times.</p>

    <button {{on "click" this.increment}}>Click</button>
  </template>
}`;

export default class ExampleREPL extends Component {
  @tracked code = STARTING_CODE;

  setCode = (inputEvent) => {
    this.code = inputEvent.target.value;
  }

  <template>
    <div class='grid gap-4 border p-4'>
      <div class='flex justify-between'>
        <label for='code'>Type your glimmer javascript here</label>
      </div>

      <textarea
        {{on 'input' this.setCode}}
        id='code' class='border p-2' rows="6">{{this.code}}</textarea>
    </div>

    {{#let (Compiled this.code "gjs") as |state|}}
      {{#if state.isWaiting}}
        building ...
      {{/if}}


      {{#if state.error}}
        {{state.error}}
      {{/if}}

      {{#if state.component}}
        <div class='border p-4'><state.component /></div>
      {{/if}}

    {{/let}}
  </template>
}
```
