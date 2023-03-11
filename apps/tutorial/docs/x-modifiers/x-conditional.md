# Conditional Modifiers

```gjs live preview
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { modifier } from 'ember-modifier';
import { on } from '@ember/modifier';

export default class HelloWorld extends Component {
  @tracked enabled = false;

  toggle = () => this.enabled = !this.enabled;

  theModifier = modifier(element => {
    element.style.textTransform = 'uppercase';

    return () => element.style.textTransform = 'lowercase';
  });

  <template>
    <p {{ (if this.enabled this.theModifier) }}>The modifier should be enabled: {{this.enabled}}</p>

    <button {{on "click" this.toggle}}>toggle modifier</button>
  </template>
}
```
