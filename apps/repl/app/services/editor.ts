import { tracked } from '@glimmer/tracking';
import { registerDestructor } from '@ember/destroyable';
import Service, { service } from '@ember/service';

import { castToBoolean } from 'ember-primitives/qp';
import { link } from 'reactiveweb/link';

import { FileURIComponent } from 'limber/utils/editor-text';

import type { DemoEntry } from '../snippets';
import type Owner from '@ember/owner';
import type RouterService from '@ember/routing/router-service';
import type { FormatQP } from '#app/languages.gts';

interface RenderInput {
  text: EditorService['text'];
  format: FormatQP;
}

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
    if (text !== this.text) {
      this.fileURIComponent.queue(text);
    }
  };

  get text() {
    return this.fileURIComponent.decoded;
  }

  get format(): FormatQP {
    return this.fileURIComponent.format;
  }

  /**
   * The file in the output pane while `?autorender=off` pauses compiling.
   * Rendering is automatic while this is undefined.
   *
   * A getter on the router would compile again on each keystroke,
   * because every edit writes the URL.
   */
  @tracked pausedFile: RenderInput | undefined;

  constructor(owner: Owner) {
    super(owner);

    this.router.on('routeDidChange', this.#syncAutoRender);
    registerDestructor(this, () => this.router.off('routeDidChange', this.#syncAutoRender));
  }

  #syncAutoRender = () => {
    const value = this.router.currentRoute?.queryParams?.['autorender'];
    const autoRender = typeof value === 'string' ? castToBoolean(value) : true;

    // Every edit writes the URL, so a new pausedFile here would compile each keystroke.
    if (autoRender === this.autoRender) return;

    this.pausedFile = autoRender ? undefined : this.#file;
  };

  get autoRender() {
    return this.pausedFile === undefined;
  }

  render = () => {
    this.pausedFile = this.#file;
  };

  get #file(): RenderInput {
    return { text: this.text, format: this.format };
  }

  /**
   * The text and format for the output pane.
   */
  get renderInput(): RenderInput {
    return this.pausedFile ?? this.#file;
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

  get setCodemirrorState() {
    return this.#editorSwapText;
  }
  set setCodemirrorState(value) {
    this.#editorSwapText = value;
  }

  update = (text: string, format: FormatQP) => {
    // Update ourselves
    this.fileURIComponent.set(text, format);

    // Update the editor
    this.setCodemirrorState?.(text, format === 'hbs' ? 'hbs|ember' : format);

    // this.fileURIComponent.flush();
  };

  updateFormat = (format: FormatQP) => {
    // Update ourselves
    this.fileURIComponent.set(this.text ?? '', format);

    // Update the editor
    this.setCodemirrorState?.(this.text ?? '', format === 'hbs' ? 'hbs|ember' : format);
  };

  updateDemo = (text: string, demo: DemoEntry) => {
    const format = demo.format;

    // Update ourselves
    this.fileURIComponent.set(text, format, demo && 'qps' in demo ? demo.qps : {});

    // Update the editor
    this.setCodemirrorState?.(text, format === 'hbs' ? 'hbs|ember' : format);
  };
}

// DO NOT DELETE: this is how TypeScript knows how to look up your services.
declare module '@ember/service' {
  interface Registry {
    editor: EditorService;
  }
}
