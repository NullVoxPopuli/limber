Provider components are components that manage state or logic and provide access to that state through yielded values or contextual components.

This pattern is useful for:
- Sharing state between multiple child components
- Encapsulating complex logic in one place
- Creating reusable behaviors

An example of a provider component:

```gjs
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

class Counter extends Component {
  @tracked count = 0;

  increment = () => this.count++;
  decrement = () => this.count--;

  <template>
    {{yield this.count this.increment this.decrement}}
  </template>
}
```

This component can be used like this:

```hbs
<Counter as |count increment decrement|>
  <p>Count: {{count}}</p>
  <button {{on 'click' increment}}>+</button>
  <button {{on 'click' decrement}}>-</button>
</Counter>
```

The provider component manages the state, while the consumer decides how to display and interact with it.

<p class="call-to-play">
  In the editor, try creating a <code>ToggleProvider</code> component that yields a boolean state and a toggle function.
</p>

