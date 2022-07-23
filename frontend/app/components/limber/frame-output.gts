import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';
import { modifier } from 'ember-modifier';

import { DEFAULT_SNIPPET } from 'limber/snippets';
import { parseEvent, fromOutput } from 'limber/utils/messaging';

import type EditorService from 'limber/services/editor';
import type RouterService from '@ember/routing/router-service';

type Type = 'glimdown' | 'gjs' | 'hbs';

function makePayload(format: Type, content: string) {
  return { format, content, from: 'limber' } as const;
}

/**
  * The Receiving Component is Limber::Output::Compiler
  */
export default class FrameOutput extends Component {
  @service declare editor: EditorService;
  @service declare router: RouterService;

  @tracked frameStatus: unknown;

  hadUnrecoverableError = false;


  /**
    * We can't post right away, because we might do so before the iframe is ready.
    * We need to wait until the frame initiates contact.
    */
  postMessage = modifier((element: HTMLIFrameElement, [_status]) => {
    if (!element.contentWindow) return;

    if (this.hadUnrecoverableError && this.frameStatus === 'ready') {
      this.hadUnrecoverableError = false;

      element.src = '/output';

      return;
    }

    let qps = this.router.currentURL.split('?')[1];
    let text = new URLSearchParams(qps).get('t') || DEFAULT_SNIPPET;
    let payload = makePayload('glimdown', text);


    element.contentWindow.postMessage(JSON.stringify(payload));
  });

  onMessage = modifier(() => {
    let handle = (event: MessageEvent) => {
      let obj = parseEvent(event);

      // TODO: move to statechart, within the service?
      if (fromOutput(obj)) {
        switch (obj.status) {
          case 'ready':
            this.frameStatus = 'ready';
            break;
          case 'error':
            this.editor.error = obj.error;
            this.editor.isCompiling = false;
            if ('unrecoverable' in obj) {
              this.hadUnrecoverableError = true;
            }
            break;
          case 'compile-begin':
            this.editor.isCompiling = true;
            break;
          case 'success':
            this.editor.error = undefined;
            this.editor.isCompiling = false;
            break;
        }
      }
    };

    window.addEventListener('message', handle);

    return () => window.removeEventListener('message', handle);
  });

  <template>
    <iframe
      {{this.postMessage this.frameStatus}}
      {{this.onMessage}}
      class="w-full h-full border-none"
      src="/output"></iframe>
  </template>
}
