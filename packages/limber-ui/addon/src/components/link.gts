import { on } from '@ember/modifier';
import { fn } from '@ember/helper';
import { service } from '../helpers/service';
import type { TOC } from '@ember/component/template-only';
import type RouterService from '@ember/routing/router-service';

const navigate = (router: RouterService, event: MouseEvent) => {
  if(!(event.target instanceof HTMLAnchorElement)) return;
  event.preventDefault();

  router.transitionTo(event.target.href);
}

export const Link: TOC<{
  Element: HTMLAnchorElement;
  Blocks: { default: [] }
}> = <template>
  {{#let (service 'router') as |router|}}
    <a
      class="
        inline-block
        text-white rounded bg-[var(--code-bg)]
        px-3 py-2
        border border-[var(--horizon-border)]
        focus:outline-none focus:ring
        focus-visible:outline-none focus-visible:ring
        shadow
        grid gap-2
        disabled:opacity-[0.3] disabled:cursor-not-allowed
      "
      ...attributes
      {{on "click" (fn navigate router)}}
    >
      {{yield}}
    </a>
  {{/let}}
</template>;
