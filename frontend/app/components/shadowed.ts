import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { setComponentTemplate } from '@ember/component';
import { hbs } from 'ember-cli-htmlbars';

import { modifier } from 'ember-could-get-used-to-this';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const assetFor = (name: string) => (window as any).assetMap[name];

class Shadowed extends Component {
  @tracked shadow?: ShadowRoot;

  attachShadow = modifier((element: HTMLElement) => {
    this.shadow = element.attachShadow({ mode: 'open' });
  });

  get stylesheets() {
    return ['assets/vendor.css', 'assets/limber.css']
      .map((sheet) => {
        return `@import "${assetFor(sheet)}";`;
      })
      .join('\n');
  }
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
