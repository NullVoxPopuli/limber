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
        class="fixed bottom-4 right-4 z-[100] max-w-[60vw] rounded border border-red-700 bg-red-100 p-4 text-black drop-shadow-md"
      >
        <pre class="whitespace-pre-wrap font-[monospace] text-base">{{this.editor.error}}</pre>
      </footer>
    {{/if}}
  </template>
}
