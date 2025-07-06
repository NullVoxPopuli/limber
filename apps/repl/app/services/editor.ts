import { tracked } from '@glimmer/tracking';
import Service, { service } from '@ember/service';

import { getCompiler } from 'ember-repl';
import { link } from 'reactiveweb/link';

import { FileURIComponent } from 'limber/utils/editor-text';

import type { DemoEntry } from '../snippets';
import type RouterService from '@ember/routing/router-service';
import type { FormatQP } from '#app/languages.gts';

export default class EditorService extends Service {
  @service declare router: RouterService;

  @tracked scrollbarWidth = 0;

  #fileURIComponent: FileURIComponent | undefined;
  get fileURIComponent() {
    if (this.#fileURIComponent) return this.#fileURIComponent;
    // eslint-disable-next-line ember/no-side-effects
    this.#fileURIComponent = new FileURIComponent();
    link(this.#fileURIComponent, this);

    return this.#fileURIComponent;
  }

  updateText = (text: string) => {
    this.fileURIComponent.queue(text);
  };

  get text() {
    return this.fileURIComponent.decoded;
  }

  get format(): FormatQP {
    return this.fileURIComponent.format;
  }

  get nohighlight() {
    return (this.router.currentRoute?.queryParams ?? {}).nohighlight;
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
  #editorSwapText?: (text: string, format: FormatQP) => void;
  #pendingUpdate?: () => void;

  get setCodemirrorState() {
    return this.#editorSwapText;
  }
  set setCodemirrorState(value) {
    this.#editorSwapText = value;

    if (this.#pendingUpdate) {
      this.#pendingUpdate();
    }
  }

  updateDemo = (text: string, demo: DemoEntry) => {
    const { format } = demo;

    if (!this.setCodemirrorState) {
      this.#pendingUpdate = () => this.updateDemo(text, demo);

      return;
    }

    // Update ourselves
    this.fileURIComponent.set(text, format, demo && 'qps' in demo ? demo.qps : {});

    // Update the editor
    this.setCodemirrorState?.(text, format);
  };
}

// DO NOT DELETE: this is how TypeScript knows how to look up your services.
declare module '@ember/service' {
  interface Registry {
    editor: EditorService;
  }
}
