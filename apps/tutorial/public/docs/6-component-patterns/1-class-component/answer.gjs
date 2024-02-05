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
