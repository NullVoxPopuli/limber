Components can have their own encapsulated state by using a [class][mdn-class].
This allows defining and access to reactive state as well as the broader application's global state system (usually dependency injected "services"), if available.

We can refactor the previous example's module-level state to be contained within a class:

```gjs 
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

export default class Demo extends Component {
  @tracked myName;

  handleInput = (event) => this.myName = event.target.value;

  <template>
    <NameInput @onInput={{this.handleInput}} /> 

    <Greeting @name={{this.myName}} />
  </template>
}
```


[mdn-class]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes
