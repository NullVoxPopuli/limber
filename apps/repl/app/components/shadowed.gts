import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

import { modifier } from 'ember-modifier';

const attachShadow = modifier((element: Element, [set]: [(shadowRoot: HTMLDivElement) => void]) => {
  let shadow = element.attachShadow({ mode: 'open' });
  let div = document.createElement('div');

  shadow.appendChild(div);

  set(div);
});

// index.html has the production-fingerprinted references to these links
// Ideally, we'd have some pre-processor scan everything for references to
// assets in public, but idk how to set that up
const getStyles = () => [...document.head.querySelectorAll('link')].map((link) => link.href);

export class Shadowed extends Component<{
  Element: HTMLDivElement;
  Args: {
    omitStyles?: boolean;
  };
  Blocks: { default: [] };
}> {
  @tracked shadow: HTMLDivElement | undefined;

  setShadow = async (shadowRoot: HTMLDivElement) => {
    await Promise.resolve();

    this.shadow = shadowRoot;
  };

  <template>
    <div data-shadow {{attachShadow this.setShadow}} ...attributes></div>

    {{#if this.shadow}}
      {{#in-element this.shadow}}
        {{#unless @omitStyles}}
          {{#each (getStyles) as |styleHref|}}
            <link rel="stylesheet" href={{styleHref}} />
          {{/each}}
        {{/unless}}

        {{yield}}
      {{/in-element}}
    {{/if}}
  </template>
}

export default Shadowed;
