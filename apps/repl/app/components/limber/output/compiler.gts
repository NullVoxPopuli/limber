import Component from '@glimmer/component';
import { service } from '@ember/service';

import { Compiled } from 'ember-repl';
import { use } from 'ember-resources';
import { debounce } from 'reactiveweb/debounce';

import type { CompileState } from 'ember-repl';
import type EditorService from 'limber/services/editor';

interface Signature {
  Blocks: {
    default: [CompileState];
  };
}

export default class Compiler extends Component<Signature> {
  <template>
    {{#let (Compiled this.text this.format) as |compiled|}}
      {{yield compiled}}
    {{/let}}
  </template>

  @service declare editor: EditorService;

  get format() {
    return this.editor.format;
  }

  @use text = debounce(300, () => this.editor.text);
}
