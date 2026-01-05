import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

export default class Counter extends Component {
  @tracked count = 0;

  increment = () => this.count++;
  decrement = () => this.count--;

  <template>
    {{yield this.count this.increment this.decrement}}
  </template>
}
