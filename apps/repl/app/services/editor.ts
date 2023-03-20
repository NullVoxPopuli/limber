import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import Service, { inject as service } from '@ember/service';
import { waitFor } from '@ember/test-waiters';

import { link } from 'ember-resources/link';

import { FileURIComponent } from 'limber/utils/editor-text';

import type RouterService from '@ember/routing/router-service';
import type { Format } from 'limber/utils/messaging';

export default class EditorService extends Service {
  @service declare router: RouterService;

  @tracked isCompiling = false;
  @tracked error?: string;
  @tracked errorLine?: number;
  @tracked scrollbarWidth = 0;

  @link(FileURIComponent) declare fileURIComponent: FileURIComponent;

  @action
  updateText(text: string) {
    this.fileURIComponent.queue(text, this.format);
  }

  get text() {
    return this.fileURIComponent.decoded;
  }

  get format() {
    return this.fileURIComponent.format;
  }

  _editorSwapText?: (text: string, format: Format) => void;

  @action
  @waitFor
  async updateDemo(text: string, format: Format) {
    // Update ourselves
    this.fileURIComponent.queue(text, format);

    // We got timing issues!
    await Promise.resolve();

    // Update the editor
    this._editorSwapText?.(text, format);
  }
}

// DO NOT DELETE: this is how TypeScript knows how to look up your services.
declare module '@ember/service' {
  interface Registry {
    editor: EditorService;
  }
}
