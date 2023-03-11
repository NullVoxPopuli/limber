import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import Service, { inject as service } from '@ember/service';

import { link } from 'ember-resources/link';

import { DEFAULT_SNIPPET } from 'limber/snippets';
import { TextURIComponent } from 'limber/utils/editor-text';

import type RouterService from '@ember/routing/router-service';
import type { Format } from 'limber/utils/messaging';

export default class EditorService extends Service {
  @service declare router: RouterService;

  @tracked isCompiling = false;
  @tracked error?: string;
  @tracked errorLine?: number;
  @tracked scrollbarWidth = 0;

  @link(TextURIComponent) declare textURIComponent: TextURIComponent;

  @action
  updateText(text: string) {
    this.textURIComponent.queue(text);
  }

  get text() {
    return this.textURIComponent.decoded ?? DEFAULT_SNIPPET;
  }

  _editorSwapText?: (text: string, format: Format) => void;

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
