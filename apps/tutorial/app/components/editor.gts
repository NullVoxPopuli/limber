import { TOC } from '@ember/component/template-only';
import { REPL, service } from 'limber-ui';

import DocsService from 'tutorial/services/docs';

const codeFor = (docs: DocsService) => {
  if (docs.showAnswer) {
    if (docs.selected.hasAnswer) {
      return docs.selected.answer;
    }
  }

  return docs.selected.prompt;
}

export const Editor: TOC<{
  Element: HTMLIFrameElement;
}> =
  <template>
    {{#let (service 'docs') as |docs|}}

      {{#if docs.selected.isReady}}

        {{#let (codeFor docs) as |code|}}
          {{#if code}}
            <REPL @code={{code}} @format="gjs" @editor={{true}} ...attributes />
          {{/if}}

        {{/let}}
      {{/if}}

    {{/let}}
  </template>

