import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { on } from '@ember/modifier';

export default class Demo extends Component {
  @tracked _count = 0;

  get count() {
    let fromStorage = parseInt(localStorage.getItem('count')) ?? 0;
    return this._count || fromStorage || 0;
  }
  set count(value) {
    localStorage.setItem('count', value ?? 0);
    this._count = value;
  }

  increment = () => this.count += 1;

  <template>
    <p>You have clicked the button {{this.count}} times.</p>

    <button type="button" {{on "click" this.increment}}>Click</button>
  </template>
}
