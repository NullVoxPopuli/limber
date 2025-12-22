import Package from '~icons/raphael/package?raw';

import type { TOC } from '@ember/component/template-only';

export const NavLink: TOC<{
  Element: HTMLAnchorElement;
  Args: { icon?: string };
  Blocks: { default: [] };
}> = <template>
  {{! template-lint-disable link-href-attributes }}
  <a ...attributes>
    {{#if @icon}}
      <span>{{! template-lint-disable no-triple-curlies }}
        {{{@icon}}}</span>
    {{/if}}
    <span>{{yield}}</span>
  </a>
</template>;

export const Topics = <template>
  <NavLink href="/docs/editor">editor</NavLink>
  <NavLink href="/docs/embedding">embedding</NavLink>
  <NavLink href="/docs/ember-repl" @icon={{Package}}>ember-repl</NavLink>
  <NavLink href="/docs/repl-sdk" @icon={{Package}}>repl-sdk</NavLink>
</template>;
