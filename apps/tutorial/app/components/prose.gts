import FaIcon from '@fortawesome/ember-fontawesome/components/fa-icon';
import { TOC } from '@ember/component/template-only';
import { on } from '@ember/modifier';
import { Link, Button, ExternalLink, service }  from 'limber-ui';

import { highlight } from './/highlight';

const editPath = (path: string | undefined) => `https://github.com/NullVoxPopuli/limber/tree/main/apps/tutorial/docs/${path}`
const not = (x: unknown) => !(x)

export const Prose: TOC<{ Element: HTMLDivElement }> =
<template>
  <div class="grid gap-4 overflow-auto pb-8 w-fit" ...attributes>

    {{#let (service 'docs') as |docs|}}

      <div data-prose class="prose p-4 max-w-[100dvw]" {{highlight docs.selected.prose}}>
        {{#if docs.selected.prose}}
          {{! template-lint-disable no-triple-curlies }}
          {{{docs.selected.prose}}}
        {{/if}}
      </div>

      <hr class="border" />

      <footer class="grid p-2 gap-4 text-sm">
        <div class="flex justify-between items-center justify-self-end w-full">
          {{#if docs.selected.hasAnswer}}
            <Button {{on "click" docs.showMe}}>
              Show me
            </Button>
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

    {{/let}}

  </div>
</template>

