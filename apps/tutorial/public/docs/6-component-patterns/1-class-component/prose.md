Classes are used for managing internal state within a component. 
This state could be a `@tracked` value, or deriving other values from `@tracked` values.

For example:
```gjs
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

export default class Demo extends Component {
  <template>
    {{this.value}}
  </template>

  @tracked value = 0;
}
```

<p class="call-to-play">
  In the editor, try adding a button that increments the <code>value</code> when clicked.
</p>

It may end up looking something like this:
```gjs
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { on } from '@ember/modifier';

export default class Demo extends Component {
  <template>
    {{this.value}}<br>
    {{this.doubled}}<br>
    <button {{on 'click' this.increment}}>increment</button>
  </template>

  // root state
  @tracked value = 0;

  // derived state
  get doubled() {
    return this.value * 2;
  }

  // action
  increment = () => this.value++;
}
```


Note that all of the state is "private", in that no JavaScript from outside the component can access it.
