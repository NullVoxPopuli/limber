import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import Service, { inject as service } from '@ember/service';

import { use } from 'ember-resources';

import { TextURIComponent } from 'limber/utils/editor-text';
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

  @use textURIComponent = TextURIComponent.from(() => ({
    setEditor: (text, format) => this._editorSwapText?.(text, format),
  }));

  _editorSwapText?: (text: string, format: Format) => void;

  @action
  updateText(text: string) {
    /**
     * Setting these properties queues an update to the URL, debounced (usually)
     */
     this.textURIComponent.set(text);
  }

  get text() {
    return this.textURIComponent.decoded;
  }

  @action
  updateDemo(text: string, format: Format) {
    // Updates the editor
    this._editorSwapText?.(text, format);

    // Update ourselves
    this.textURIComponent.set(text, format);
  }

}

// DO NOT DELETE: this is how TypeScript knows how to look up your services.
declare module '@ember/service' {
  interface Registry {
    editor: EditorService;
  }
}
