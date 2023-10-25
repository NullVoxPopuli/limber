import { on } from '@ember/modifier';

import FaIcon from '@fortawesome/ember-fontawesome/components/fa-icon';
import { modifier } from 'ember-modifier';
import { StickyFooter } from 'ember-primitives';
import { cell } from 'ember-resources';

import { Button, ExternalLink, Link, service } from 'limber-ui';

import { highlight } from './highlight';

import type { TOC } from '@ember/component/template-only';

const editPath = (path: string | undefined) =>
  `https://github.com/NullVoxPopuli/limber/tree/main/apps/tutorial/docs${path}`;
const not = (x: unknown) => !x;

export const resetScroll = modifier((element, [prose]) => {
  prose;
  element.scrollTo(0, 0);
});

const hideText = cell(true);
const hoverShowText = () => (hideText.current = false);
const hideShowText = () => (hideText.current = true);

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
          {{#if docs.selected.prose}}
            {{! template-lint-disable no-triple-curlies }}
            {{{docs.selected.prose}}}
          {{/if}}
        </div>
      </:content>

      <:footer>
        <footer class="grid p-2 gap-4 text-sm bg-[#eee] drop-shadow-2xl">
          <div class="flex justify-between items-center justify-self-end w-full">
            {{#if docs.selected.hasAnswer}}
              <Button
                @variant="primary"
                class="w-[86px] hover:w-[166px] focus-visible:w-[166px] whitespace-nowrap transition-all overflow-hidden text-left"
                style="transition-duration: 50ms"
                {{on "click" docs.showMe}}
                {{on "mouseenter" hoverShowText}}
                {{on "mouseleave" hideShowText}}
                {{on "focusin" hoverShowText}}
                {{on "focusout" hideShowText}}
              >
                <span>
                  Show me
                  <span class="{{if hideText.current 'sr-only'}}">the answer</span>
                </span>
              </Button>
            {{else}}
              <span></span>
            {{/if}}

            <Link href={{docs.selected.next.path}} @isDisabled={{not docs.selected.next.path}}>
              <span>Next</span>
              <FaIcon @icon="angle-right" />
            </Link>
          </div>

          <ExternalLink href={{editPath docs.selected.path}}>
            Edit this page
          </ExternalLink>

        </footer>
      </:footer>
    </StickyFooter>
  {{/let}}
</template>;
