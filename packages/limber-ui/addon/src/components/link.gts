import { on } from '@ember/modifier';
import { fn } from '@ember/helper';
import { htmlSafe } from '@ember/template';
import { service } from '../helpers/service';

import type { TOC } from '@ember/component/template-only';
import type RouterService from '@ember/routing/router-service';

const navigate = (router: RouterService, event: MouseEvent) => {
  if(!(event.target instanceof HTMLAnchorElement)) return;
  event.preventDefault();

  /**
   * The href includes the protocol/host/etc
   * In order to not have the page look like a full page refresh,
   * we need to chop that "origin" off, and just use the path
   */
  let url = new URL(event.target.href);

  router.transitionTo(url.pathname);
}

const classList = htmlSafe(`
  inline-block
  text-white rounded bg-[var(--code-bg)]
  px-3 py-2
  border border-[var(--horizon-border)]
  focus:outline-none focus:ring
  focus-visible:outline-none focus-visible:ring
  shadow
  grid gap-2
`);

export const Link: TOC<{
  Element: HTMLAnchorElement | HTMLSpanElement;
  Args: {
    /**
      * Link / Anchor tags can't really be disabled,
      * so we need a another way to communicate that the link is inactive.
      *
      * When `@isDisabled` is true, the anchor will be swapped out with a span
      * but with the same styling (except for communicating that the element is disabled).
      */
    isDisabled?: boolean;
  };
  Blocks: { default: [] }
}> = <template>
  {{#if @isDisabled}}
    <span
      class="{{classList}} opacity-30"
      ...attributes
      tabindex="1"
    >
      {{yield}}
    </span>
  {{else}}
    {{#let (service 'router') as |router|}}
      <a
        class={{classList}}
        ...attributes
        {{on "click" (fn navigate router)}}
      >
        {{yield}}
      </a>
    {{/let}}
  {{/if}}
</template>;
