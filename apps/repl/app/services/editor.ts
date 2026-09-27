import { tracked } from '@glimmer/tracking';
import { registerDestructor } from '@ember/destroyable';
import Service, { service } from '@ember/service';

import { castToBoolean } from 'ember-primitives/qp';
import { use } from 'ember-resources';
import { keepLatest } from 'reactiveweb/keep-latest';
import { link } from 'reactiveweb/link';

import { FileURIComponent } from 'limber/utils/editor-text';

import type { DemoEntry } from '../snippets';
import type Owner from '@ember/owner';
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
   * `?autorender=off` pauses compiling as the user types.
   *
   * This is a field instead of a getter on the router, because every edit writes the URL.
   * A getter would invalidate renderInput on each keystroke and compile the same text again.
   */
  @tracked autoRender = true;

  constructor(owner: Owner) {
    super(owner);

    this.router.on('routeDidChange', this.#syncAutoRender);
    registerDestructor(this, () => this.router.off('routeDidChange', this.#syncAutoRender));
  }

  #syncAutoRender = () => {
    const value = this.router.currentRoute?.queryParams?.['autorender'];
    const next = typeof value === 'string' ? castToBoolean(value) : true;

    // Setting a tracked field dirties it even when the value is the same.
    if (next !== this.autoRender) this.autoRender = next;
  };

  @tracked renderRequests = 0;
  #seenRenderRequests = -1;

  render = () => {
    this.renderRequests++;
  };

  /**
   * The text and format for the output pane.
   *
   * While paused, the value function returns undefined without a read of `text`,
   * so keepLatest keeps the last rendered file and edits do not compile.
   *
   * Exception: a render reads `text` and `format`, which come from the URL,
   * so the first edit after it compiles the same file once more.
   */
  @use renderInput = keepLatest({
    when: () => !this.autoRender,
    value: () => {
      if (!this.autoRender && this.renderRequests === this.#seenRenderRequests) {
        return undefined;
      }

      const { text, format } = this;

      // Before the route loads a document there is no text,
      // and that must not count as the render for a paused first load.
      if (text) this.#seenRenderRequests = this.renderRequests;

      return { text, format };
    },
  });

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
