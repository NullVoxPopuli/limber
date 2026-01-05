import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

export default class Counter extends Component {
  @tracked count = 0;

  increment = () => this.count++;
  decrement = () => this.count--;

  <template>
    {{! TODO: Convert this to yield a hash instead }}
    {{yield this.count this.increment this.decrement}}
  </template>
}

