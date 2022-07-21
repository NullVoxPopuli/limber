import Component from '@glimmer/component';
import { service } from '@ember/service';
import { modifier } from 'ember-modifier';

import { DEFAULT_SNIPPET } from 'limber/snippets';

import type EditorService from 'limber/services/editor';
import type RouterService from '@ember/routing/router-service';

type Type = 'glimdown' | 'gjs' | 'hbs';

function makePayload(type: Type, content: string) {
  return { type, content, from: 'limber' } as const;
}

export default class FrameOutput extends Component {
  @service declare editor: EditorService;
  @service declare router: RouterService;

  /**
    * We can't post right away, because we might do so before the iframe is ready.
    * We need to wait until the frame initiates contact.
    */
  postMessage = modifier((element: HTMLIFrameElement) => {
    let qps = this.router.currentURL.split('?')[1];
    let text = new URLSearchParams(qps).get('t') || DEFAULT_SNIPPET;
    let payload = makePayload('glimdown', text);

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
