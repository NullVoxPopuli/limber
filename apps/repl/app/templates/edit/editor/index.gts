import './styles.css';

import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';

import { Key } from 'ember-primitives/components/keys';

import { codemirror } from './code-mirror.ts';
import Loader from './loader.gts';
import { LoadingError } from './loading-error.gts';
import { Placeholder } from './placeholder.gts';

import type EditorService from '#app/services/editor.ts';


export class Editor extends Component<{ Element: HTMLDivElement }> {
  @service declare editor: EditorService;

@tracked isLoading = false;
@tracked isDone = false;
@tracked error = null;

handleStateChange = (state: { isLoading: boolean, isDone: boolean, error: unknown}) => {
  Object.assign(this, state);
};



<template>
  <div class="overflow-hidden overflow-y-auto limber__editor">
    <div class="limber__editor__tab-help">press <Key>esc</Key> to <Key>tab</Key> out</div>
    {{! template-lint-disable no-inline-styles }}
    <div style="width: 100%; height: 100%;" {{codemirror defer=true onStateChange=this.handleStateChange}}>{{this.editor.text}}</div>
  </div>


    {{#if this.isDone}}


    {{else}}
      <div
        class="syntax-dark bg-code-bg relative overflow-hidden border border-gray-900"
        ...attributes
      >

        {{#if this.isLoading}}
          <Loader />
        {{/if}}

        {{#if this.error}}
          <LoadingError @error={{this.error}} />
        {{/if}}

        <Placeholder />
      </div>
    {{/if}}
</template>;
}
