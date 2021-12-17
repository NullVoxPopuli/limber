import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

interface Args {
  omitStyles: boolean;
}

class Shadowed extends Component<Args> {
  @tracked shadow?: ShadowRoot;

  vendor = '/assets/vendor.css';
  app = '/assets/limber.css';

  attachShadow = (element: HTMLElement) => {
    this.shadow = element.attachShadow({ mode: 'open' });
  };

  <template>
    <div {{this.attachShadow}}></div>

    {{#if this.shadow}}
      {{#in-element this.shadow}}
        {{#unless @omitStyles}}
          <style>
            @import "{{this.vendor}}";
            @import "{{this.app}}";
          </style>
        {{/unless}}

        {{yield}}
      {{/in-element}}
    {{/if}}
  </template>
}

