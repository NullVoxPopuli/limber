import Component from '@glimmer/component';
import { service } from '@ember/service';

import { Compiled } from 'ember-repl';
import { use } from 'ember-resources';
import { debounce } from 'reactiveweb/debounce';

import type { CompileState, Format } from 'ember-repl';
import type EditorService from 'limber/services/editor';

interface Signature {
  Blocks: {
    default: [CompileState];
  };
}

export default class Compiler extends Component<Signature> {
  <template>
    {{#let (Compiled this.text this.format this.flavor) as |compiled|}}
      {{yield compiled}}
    {{/let}}
  </template>

  @service declare editor: EditorService;

  get formatQP() {
    return this.editor.format;
  }

  get formatQPParts() {
    return this.formatQP.split('|');
  }

  get format() {
    return this.formatQPParts[0] as Format;
  }

  get flavor() {
    return this.formatQPParts[1] as string | undefined;
  }

  @use text = debounce(300, () => this.editor.text);
}
