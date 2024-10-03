import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { getOwner, setOwner } from '@ember/owner';
import Service, { inject as service } from '@ember/service';

import { link } from 'reactiveweb/link';

import { FileURIComponent } from 'limber/utils/editor-text';

import type RouterService from '@ember/routing/router-service';
import type { Format } from 'limber/utils/messaging';

export default class EditorService extends Service {
  @service declare router: RouterService;

  @tracked isCompiling = false;
  @tracked error?: string;
  @tracked errorLine?: number;
  @tracked scrollbarWidth = 0;

  // @link(FileURIComponent) declare fileURIComponent: FileURIComponent;
  get fileURIComponent() {
    let instance = new FileURIComponent();

    setOwner(instance, getOwner(this));

    return instance;
  }

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

  /**
   * This function is set by a modifier,
   * which means the timing of its existence is dependent on
   * render speed, how busy the browser is, etc.
   *
   * But updateDemo *could* be called via parent iframe
   * before _editorSwapText exists.
   * If this happens, we need to wait until _editorSwapText
   * exists and _then_ finish calling update demo.
   *
   */
  #editorSwapText?: (text: string, format: Format) => void;
  #pendingUpdate?: () => void;

  get _editorSwapText() {
    return this.#editorSwapText;
  }
  set _editorSwapText(value) {
    this.#editorSwapText = value;

    if (this.#pendingUpdate) {
      this.#pendingUpdate();
    }
  }

  @action
  updateDemo(text: string, format: Format) {
    if (!this._editorSwapText) {
      this.#pendingUpdate = () => this.updateDemo(text, format);

      return;
    }

    // Update ourselves
    this.fileURIComponent.set(text, format);

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
