import { htmlSafe } from "@ember/template";

import type { TOC } from "@ember/component/template-only";

const classList = htmlSafe(`
  inline-block items-center grid-flow-col
  text-white rounded bg-[var(--code-bg)]
  px-3 py-2
  border border-[var(--horizon-border)]
  hover:underline
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
  Blocks: { default: [] };
}> = <template>
  {{#if @isDisabled}}

    <span class="{{classList}} opacity-30" ...attributes tabindex="0">
      {{yield}}
    </span>

  {{else}}

    {{! href attribute should be passed in to Link }}
    {{! The lints maybe need a runtime integration. }}
    {{! template-lint-disable link-href-attributes }}
    <a class={{classList}} ...attributes>
      {{yield}}
    </a>

  {{/if}}
</template>;
