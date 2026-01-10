import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { on } from '@ember/modifier';

const findTarget = (selector) => document.querySelector(selector);

export default class Demo extends Component {
  @tracked showPortal = false;

  toggle = () => this.showPortal = !this.showPortal;

  <template>
    <div id="portal-target" style="border: 2px solid blue; padding: 1rem; margin-bottom: 1rem;">
      Portal Target
    </div>

    <button {{on 'click' this.toggle}}>Toggle Portal</button>

    {{#if this.showPortal}}
      {{#in-element (findTarget '#portal-target')}}
        <div style="background: #eee; padding: 1rem;">
          ✓ This content is portalled to the target!
        </div>
      {{/in-element}}
    {{else}}
      <div style="background: #eee; padding: 1rem; margin-top: 1rem;">
        Content is currently in normal position
      </div>
    {{/if}}
  </template>
}
