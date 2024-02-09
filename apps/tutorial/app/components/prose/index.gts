import { modifier } from 'ember-modifier';
import { StickyFooter } from 'ember-primitives';

import { service } from 'limber-ui';

import { FooterContent } from './footer';
import { highlight } from './highlight';
import { NotFound } from './prose-not-found';

import type { TOC } from '@ember/component/template-only';

export const resetScroll = modifier((element, [prose]) => {
  prose;
  element.scrollTo(0, 0);
});

export const Prose: TOC<{ Element: HTMLDivElement }> = <template>
  {{#let (service "docs") as |docs|}}
    <style>
      .ember-primitives__sticky-footer__footer { position: sticky; bottom: -32px; } .call-to-play {
      filter: drop-shadow(0px 2px 2px rgba(0,0,0,0.5)); border: 3px dashed var(--horizon-lavender);
      padding: 0.75rem; text-align: right; border-radius: 0.25rem; background: var(--ember-linen);
      color: black; transform: skewX(-15deg); width: calc(100% - 6rem); margin-left: auto;
      margin-right: 0.8rem; font-weight: 500; font-family: system-ui; font-size: 1.125rem; }
    </style>
    <StickyFooter
      class="grid gap-4 overflow-auto w-fit w-full"
      ...attributes
      {{resetScroll docs.selected.prose}}
    >
      <:content>
        <div data-prose class="prose p-4" {{highlight docs.selected.prose}}>
          {{#if docs.selected.hasProse}}
            {{! template-lint-disable no-triple-curlies }}
            {{{docs.selected.prose}}}
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
