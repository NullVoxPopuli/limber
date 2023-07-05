import Component from '@glimmer/component';
import { service } from '@ember/service';

import type EditorService from 'limber/services/editor';

interface Signature {
  Element: HTMLElement | null;
}

export default class EditorError extends Component<Signature> {
  @service declare editor: EditorService;

  <template>
    {{#if this.editor.error}}

      <footer
        data-test-error
        class='rounded fixed right-4 bottom-4 p-4 bg-red-100 text-black drop-shadow-md border border-red-700 max-w-[60vw] z-[100]'
      >
        <pre class='font-[monospace] text-base whitespace-pre-wrap'>{{this.editor.error}}</pre>
      </footer>
    {{/if}}
  </template>
}
