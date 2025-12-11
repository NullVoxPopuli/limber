import { modifier } from 'ember-modifier';
import { service } from 'ember-primitives/helpers/service';
import { StickyFooter } from 'ember-primitives/layout/sticky-footer';

import { FooterContent } from './footer';
import { NotFound } from './prose-not-found';

import type { TOC } from '@ember/component/template-only';

export const resetScroll = modifier((element, [prose]) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-expressions
  prose;
  element.scrollTo(0, 0);
});

export const Prose: TOC<{ Element: HTMLDivElement }> = <template>
  {{#let (service "docs") as |docs|}}
    <style>
      .ember-primitives__sticky-footer__wrapper {
        height: calc(100dvh - 94px);
      }
      .ember-primitives__sticky-footer__footer {
        position: sticky;
        bottom: -32px;
      }
      .call-to-play {
        filter: drop-shadow(0px 2px 2px rgba(0, 0, 0, 0.5));
        border: 3px dashed var(--horizon-lavender);
        padding: 0.75rem;
        text-align: right;
        border-radius: 0.25rem;
        background: var(--ember-linen);
        color: black;
        transform: skewX(-15deg);
        width: calc(100% - 6rem);
        margin-left: auto;
        margin-right: 0.8rem;
        font-weight: 500;
        font-family: system-ui;
        font-size: 1.125rem;
      }
    </style>
    <StickyFooter
      class="gap-4 grid w-fit w-full overflow-auto"
      ...attributes
      {{resetScroll docs.selected.prose}}
    >
      <:content>
        <div data-prose class="prose p-4">
          {{#if docs.selected.hasProse}}
            <docs.selected.prose />
          {{else}}
            <NotFound />
          {{/if}}
        </div>
      </:content>

      <:footer>
        <FooterContent />
      </:footer>
    </StickyFooter>
  {{/let}}
</template>;
