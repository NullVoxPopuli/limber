import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { on } from '@ember/modifier';

export default class Incrementer extends Component {
  @tracked clicks = 0;
  @tracked enableIncrement = true;

  handleClick = () => this.clicks++;
  toggle = () => this.enableIncrement = !this.enableIncrement;

  <template>
    <button {{ (if this.enableIncrement (modifier on 'click' this.handleClick)) }}>
      Click me!
    </button>

    <button {{on 'click' this.toggle}}>
      Toggle Clicking
    </button>

    <br>
    Increment Enabled: {{this.enableIncrement}}<br>
    Clicked: {{this.clicks}}
  </template>
}
