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

export class Editor extends Component {
  @service declare editor: EditorService;

  @tracked isLoading = false;
  @tracked isDone = false;
  @tracked error = null;

  handleStateChange = (state: {
    isLoading: boolean;
    isDone: boolean;
    error: unknown;
  }) => {
    // What could go wrong? ;)
    Object.assign(this, state);
  };

  <template>
    <div class="limber__editor overflow-hidden overflow-y-auto">
      <div class="limber__editor__tab-help">press
        <Key>esc</Key>
        to
        <Key>tab</Key>
        out</div>
      <div
        class="limber__editor__codemirror"
        {{codemirror defer=true onStateChange=this.handleStateChange}}
      >{{this.editor.text}}</div>
    </div>

    {{#unless this.isDone}}
      <div class="limber__editor__pending syntax-dark">

        {{#if this.isLoading}}
          <Loader />
        {{/if}}

        {{#if this.error}}
          <LoadingError @error={{this.error}} />
        {{/if}}

        <Placeholder />
      </div>
    {{/unless}}
  </template>
}
