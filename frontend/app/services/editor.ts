import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { debounce } from '@ember/runloop';
import Service, { inject as service } from '@ember/service';

import { getQP } from 'limber/utils/query-params';

import type RouterService from '@ember/routing/router-service';
import type { Format } from 'limber/utils/messaging';

export default class EditorService extends Service {
  @service declare router: RouterService;

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
    this.text = text;
    debounce(this, this._updateSnippet, 300);
  }

  @action
  updateDemo(text: string, format: Format) {
    // Updates the editor
    this._editorSwapText?.(text, format);

    // Update ourselves
    this.text = text;
    this.format = format;
    this._updateSnippet();
  }
}

// DO NOT DELETE: this is how TypeScript knows how to look up your services.
declare module '@ember/service' {
  interface Registry {
    editor: EditorService;
  }
}
