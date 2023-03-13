import { on } from '@ember/modifier';
import { Button, ExternalLink, service }  from 'limber-ui';

import { highlight } from './/highlight';


const editPath = (path: string | undefined) => `https://github.com/NullVoxPopuli/limber/tree/main/apps/tutorial/docs/${path}`

export const Prose =
<template>
  <div class="grid gap-4">

    {{#let (service 'docs') as |docs|}}

      <div class="prose p-4" {{highlight docs.selected.prose}}>
        {{#if docs.selected.prose}}
          {{! template-lint-disable no-triple-curlies }}
          {{{docs.selected.prose}}}
        {{/if}}
      </div>

      <hr class="border" />

      <footer class="flex justify-between items-center p-2 text-sm">
        {{#if docs.selected.hasAnswer}}
          <Button {{on "click" docs.showMe}}>
            Show me
          </Button>
        {{/if}}

        <ExternalLink href={{editPath docs.selected.path}}>
          Edit this page
        </ExternalLink>
      </footer>

    {{/let}}

  </div>
</template>

