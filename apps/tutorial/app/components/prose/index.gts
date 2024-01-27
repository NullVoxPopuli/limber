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
      .ember-primitives__sticky-footer__footer { position: sticky; bottom: -32px; }
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
