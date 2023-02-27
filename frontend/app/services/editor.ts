import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import Service, { inject as service } from '@ember/service';

import { getQP } from 'limber/utils/query-params';

import type EditorText from './editor-text';
import type RouterService from '@ember/routing/router-service';
import type { Format } from 'limber/utils/messaging';

export default class EditorService extends Service {
  @service declare router: RouterService;
  @service declare editorText: EditorText;

  errorOnLoad = getQP('e');

  @tracked isCompiling = false;
  @tracked error?: string;
  @tracked errorLine?: number;
  @tracked scrollbarWidth = 0;

  _editorSwapText?: (text: string, format: Format) => void;

  @action
  updateText(text: string) {
    /**
     * Setting these properties queues an update to the URL, debounced (usually)
     */
    this.editorText.relaxedUpdate(text);
  }

  @action
  updateDemo(text: string, format: Format) {
    // Updates the editor
    this._editorSwapText?.(text, format);

    // Update ourselves
    this.editorText.immediateUpdate(text, format);
  }

}

// DO NOT DELETE: this is how TypeScript knows how to look up your services.
declare module '@ember/service' {
  interface Registry {
    editor: EditorService;
  }
}
