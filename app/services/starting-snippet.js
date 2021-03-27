export const DEFAULT_SNIPPET = `
# Limber Editor

**glimdown** //  _Ember or Glimmer  rendered with markdown_

Similar to MDX!

## TODOs

- bundle [babel][1]
- bundle [ember-template-imports][2]
- add new [glimdown syntax][3] to various editors

## Template only content

List of links:
<ul>
  {{#each (array
    (hash href='https://emberjs.com' text='Ember home page')
    (hash href='https://github.com/nullvoxpopuli' text='My GitHub')
    (hash href='https://twitter.com/nullvoxpopuli' text='My Twitter')
  ) as |site|}}
    <li>
      <a href={{site.href}} target="_blank">{{site.text}}</a>
    </li>
  {{/each}}
</ul>

## With JavaScript

\`\`\`gjs live
import Component, { tracked } from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { on } from '@ember/modifier';

export default class HelloWorld extends Component {
  @tracked count = 1;

  increment = () => this.count++;

  <template>
    <p>You have clicked the button {{this.count}} times.</p>

    <button {{on "click" this.increment}}>Click</button>
  </template>
}
\`\`\`

[1]: https://github.com/glimmerjs/glimmer-experimental/tree/master/packages/examples/playground
[2]: https://github.com/ember-template-imports/ember-template-imports
[3]: https://github.com/NullVoxPopuli/limber/issues/14
`.trim();
