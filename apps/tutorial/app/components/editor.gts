import { service } from 'ember-primitives/helpers/service';

import { REPL } from 'limber-ui';

import type { TOC } from '@ember/component/template-only';
import type DocsService from 'tutorial/services/docs';

const codeFor = (docs: DocsService) => {
  if (docs.showAnswer) {
    if (docs.selected.hasAnswer) {
      return docs.selected.answer.content;
    }
  }

  if (docs.selected.hasPrompt) {
    return docs.selected.prompt.content;
  }

  return `<template>
  Not Found. Please check the URL.
  <br><br>
  (or navigate to a tutorial chapter)
</template>`;
};

export const Editor: TOC<{
  Element: HTMLIFrameElement;
}> = <template>
  {{#let (service "docs") as |docs|}}

    {{#if docs.selected.isReady}}

      {{#let (codeFor docs) as |code|}}
        {{#if code}}
          <REPL
            @code={{code}}
            @format="gjs"
            @editorLoad="force"
            @title="workbook-area"
            @nohighlight={{true}}
            ...attributes
          />
        {{/if}}

      {{/let}}
    {{/if}}

  {{/let}}
</template>;
