import Component from '@glimmer/component';
import { service } from '@ember/service';

import { Compiled } from 'ember-repl';

import type { ComponentLike } from '@glint/template';
import type EditorService from 'limber/services/editor';
import type { Format } from 'limber/utils/messaging';

interface Signature {
  Blocks: {
    default: [
      {
        component: ComponentLike<never> | undefined;
        format: Format | undefined;
      },
    ];
  };
}

/**
 * The Receiving Component is Limber::FrameOutput
 */
export default class Compiler extends Component<Signature> {
  <template>
    {{#let (Compiled this.text this.format) as |compiled|}}
      {{log this.text this.format}}
      {{yield compiled}}
    {{/let}}
  </template>

  @service declare editor: EditorService;

  get format() {
    return this.editor.format;
  }

  get text() {
    return this.editor.text;
  }
}
