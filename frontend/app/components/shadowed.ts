import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { setComponentTemplate } from '@ember/component';
import { hbs } from 'ember-cli-htmlbars';

class Shadowed extends Component {
  @tracked shadow?: ShadowRoot;

  attachShadow = (element: HTMLElement) => {
    this.shadow = element.attachShadow({ mode: 'open' });
  };
}

export default setComponentTemplate(
  hbs`
    <div {{this.attachShadow}}></div>

    {{#if this.shadow}}
      {{#in-element this.shadow}}
        <style>
          @import "/assets/vendor.css";
          @import "/assets/limber.css";
        </style>
        {{yield}}
      {{/in-element}}
    {{/if}}
  `,
  Shadowed
);
