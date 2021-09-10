# Build your own REPL

This app is powered by the [ember-repl](https://github.com/NullVoxPopuli/ember-repl)
package, which bundles the template compiler, \`@babel/standalone\`, and the
ember/glimmer dev dependencies.
These are dynamically imported, so if your app does not need these dependencies on boot,
your app's time-to-interactive will be unaffected.

### Usage of `ember-repl` may look like this

```gjs live preview
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { on } from '@ember/modifier';
import { compileJS } from 'ember-repl';

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
  @tracked component;
  @tracked error;

  @action setCode(inputEvent) {
    this.code = inputEvent.target.value;
  }

  @action async render(submitEvent) {
    submitEvent.preventDefault();
    this.error = null;

    try {
      let { component, error } = await compileJS(this.code);

      if (error) {
        this.error = error;
        return;
      }
      this.component = component;
    } catch (e) {
      this.error = e.message;
    }
  }

  <template>
    {{#if this.error}}
      {{this.error}}
    {{/if}}

    <form {{on 'submit' this.render}} class='grid gap-4 border p-4'>
      <div class='flex justify-between'>
        <label for='code'>Type your glimmer javascript here</label>
        <button type='submit'>Render</button>
      </div>

      <textarea
        {{on 'input' this.setCode}}
        id='code' class='border p-2' rows="6">{{this.code}}</textarea>
    </form>

    {{#if this.component}}
      <div class='border p-4'><this.component /></div>
    {{/if}}
  </template>
}
```

