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

In the editor, try adding a button that increments the `value` when clicked.

It may end up looking something like this:
```gjs
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { on } from '@ember/modifier';

export default class Demo extends Component {
  <template>
    {{this.value}}<br>
    <button {{on 'click' this.increment}}>increment</button>
  </template>

  @tracked value = 0;

  increment = () => this.value++;
}
```


Note that all of the state is "private", in that no JavaScript from outside the component can access it.
