import { tracked } from '@glimmer/tracking';
import Service, { service } from '@ember/service';

import { link } from 'reactiveweb/link';

import { ProjectState } from 'limber/utils/editor-text';

import type { DemoEntry } from '../snippets';
import type RouterService from '@ember/routing/router-service';
import type { FormatQP } from '#app/languages.gts';

export default class EditorService extends Service {
  @service declare router: RouterService;

  @tracked scrollbarWidth = 0;

  #state: ProjectState | undefined;
  get state() {
    if (this.#state) return this.#state;
    // eslint-disable-next-line ember/no-side-effects
    this.#state = new ProjectState();
    link(this.#state, this);

    return this.#state;
  }

  get project() {
    return this.state.project;
  }

  get text() {
    return this.state.text;
  }

  get format(): FormatQP {
    return this.state.format;
  }

  get nohighlight() {
    return (this.router.currentRoute?.queryParams ?? {}).nohighlight;
  }

  updateText = (text: string) => {
    if (text !== this.text) {
      this.state.queue(text);
    }
  };

  flush = () => this.state.flush();

  toClipboard = () => this.state.toClipboard();

  /**
   * Change how the current text is interpreted, without replacing it.
   */
  forceFormat = (format: FormatQP) => {
    this.state.forceFormat(format);
  };

  /**
   * Swap the document without going through the editor.
   */
  replace = (text: string, format: FormatQP, extraQPs?: Record<string, string>) => {
    this.state.set(text, format, extraQPs);
  };

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

  get setCodemirrorState() {
    return this.#editorSwapText;
  }
  set setCodemirrorState(value) {
    this.#editorSwapText = value;
  }

  update = (text: string, format: FormatQP) => {
    this.state.set(text, format);

    this.setCodemirrorState?.(text, format === 'hbs' ? 'hbs|ember' : format);
  };

  updateFormat = (format: FormatQP) => {
    this.state.set(this.text ?? '', format);

    this.setCodemirrorState?.(this.text ?? '', format === 'hbs' ? 'hbs|ember' : format);
  };

  updateDemo = (text: string, demo: DemoEntry) => {
    const format = demo.format;

    this.state.set(text, format, demo && 'qps' in demo ? demo.qps : {});

    this.setCodemirrorState?.(text, format === 'hbs' ? 'hbs|ember' : format);
  };
}

// DO NOT DELETE: this is how TypeScript knows how to look up your services.
declare module '@ember/service' {
  interface Registry {
    editor: EditorService;
  }
}
