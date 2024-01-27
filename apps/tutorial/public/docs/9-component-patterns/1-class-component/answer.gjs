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
