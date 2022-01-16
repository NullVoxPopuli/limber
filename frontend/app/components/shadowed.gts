import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

interface Args {
  omitStyles: boolean;
}

export default class Shadowed extends Component<Args> {
  @tracked shadow?: ShadowRoot;

  vendor = '/assets/vendor.css';
  tailwind = '/assets/tailwind.css';
  app = '/assets/limber.css';

  attachShadow = (element: HTMLElement) => {
    this.shadow = element.attachShadow({ mode: 'open' });
  };

  <template>
    <div {{this.attachShadow}}></div>

    {{#if this.shadow}}
      {{#in-element this.shadow}}
        {{#unless @omitStyles}}
          <style type="text/css">
            @import '{{this.tailwind}}';
            @import '{{this.vendor}}';
            @import '{{this.app}}';
          </style>
        {{/unless}}

        {{yield}}
      {{/in-element}}
    {{/if}}
  </template>
}

