import Component from '@glimmer/component';
import { service } from '@ember/service';
import { modifier } from 'ember-modifier';

import type EditorService from 'limber/services/editor';

type Type = 'glimdown' | 'gjs' | 'hbs';

function makePayload(type: Type, content: string) {
  return { type, content };
}

export default class FrameOutput extends Component {
  @service declare editor: EditorService;

  postMessage = modifier((element: HTMLIFrameElement) => {
    let payload = makePayload('glimdown', this.editor.text);

    if (!element.contentWindow) return;

    element.contentWindow.postMessage(JSON.stringify(payload));
  });

  onMessage = modifier(() => {
    let handle = (...args: unknown[]) => console.log('received', ...args);

    window.addEventListener('message', handle);

    return () => window.removeEventListener('message', handle);
  });

  <template>
    <iframe
      {{this.postMessage}}
      {{this.onMessage}}
      class="w-full h-full border-none"
      src="/output"></iframe>
  </template>
}
