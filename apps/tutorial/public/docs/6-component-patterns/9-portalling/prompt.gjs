import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { on } from '@ember/modifier';

const findTarget = (selector) => document.querySelector(selector);

export default class Demo extends Component {
  @tracked showPortal = false;

  toggle = () => this.showPortal = !this.showPortal;

  <template>
    <div id="portal-target" style="border: 2px solid blue; padding: 1rem; margin-bottom: 1rem;">
      Portal Target (empty initially)
    </div>

    <button {{on 'click' this.toggle}}>Toggle Portal</button>

    {{! TODO: Add conditional and in-element helper to portal content to #portal-target }}
    <div style="background: #eee; padding: 1rem;">
      This content should be portalled when the button is clicked
    </div>
  </template>
}
