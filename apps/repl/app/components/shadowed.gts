import { modifier } from 'ember-modifier';
import { cell } from 'ember-resources';

import type { TOC } from '@ember/component/template-only';

type SetShadow = ReturnType<typeof cell<ShadowRoot>>['set'];

const attachShadow = modifier((element: Element, [setShadow]: [SetShadow]) => {
  setShadow(element.attachShadow({ mode: 'open' }));
});

// index.html has the production-fingerprinted references to these links
// Ideally, we'd have some pre-processor scan everything for references to
// assets in public, but idk how to set that up
const getStyles = () => [...document.head.querySelectorAll('link')].map((link) => link.href);

const shadowRoot = () => cell<ShadowRoot>();

export const Shadowed: TOC<{
  Element: HTMLDivElement;
  Args: {
    omitStyles?: boolean;
  };
  Blocks: { default: [] };
}> = <template>
  {{#let (shadowRoot) as |shadow|}}
    {{! @glint-ignore }}
    <div data-shadow {{attachShadow shadow.set}} ...attributes></div>

    {{#if shadow.current}}
      {{#in-element shadow.current}}
        {{#unless @omitStyles}}
          {{#let (getStyles) as |styles|}}
            {{#each styles as |styleHref|}}
              <link rel="stylesheet" href={{styleHref}} />
            {{/each}}
          {{/let}}
        {{/unless}}

        {{yield}}
      {{/in-element}}
    {{/if}}
  {{/let}}
</template>;

export default Shadowed;
