import { tracked } from '@glimmer/tracking';
import { registerDestructor } from '@ember/destroyable';
import Service, { service } from '@ember/service';
import { VERSION } from '@ember/version';

import { castToBoolean } from 'ember-primitives/qp';
import { link } from 'reactiveweb/link';

import { editorFormatFor, editorFormatOf, FILE_EXTENSIONS, infoFor } from '#app/languages.gts';

import { parseDeps, type Versions } from 'limber/utils/dependencies';
import { FileURIComponent } from 'limber/utils/editor-text';

import type { DemoEntry } from '../snippets';
import type Owner from '@ember/owner';
import type RouterService from '@ember/routing/router-service';
import type { FormatQP } from '#app/languages.gts';

interface RenderInput {
  text: EditorService['text'];
  format: FormatQP;
  versions: Versions;
  files: Record<string, string>;
}

const FILES_OPEN_KEY = 'limber:files-open';

function readFilesOpen(): boolean | undefined {
  try {
    const value = localStorage.getItem(FILES_OPEN_KEY);

    return value === null ? undefined : value === 'true';
  } catch {
    return undefined;
  }
}

function writeFilesOpen(value: boolean) {
  try {
    localStorage.setItem(FILES_OPEN_KEY, String(value));
  } catch {
    /* Private windows can refuse storage. The toggle still works. */
  }
}

/**
 * `./a.gjs`, `/a.gjs`, and `src/a.gjs` all name `a.gjs`.
 */
export function normalizePath(path: string) {
  return path
    .trim()
    .replace(/^\.?\//, '')
    .replace(/^src\//, '');
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
    const path = this.activePath;

    if (path !== undefined) {
      if (this.files[path] !== text) {
        this.fileURIComponent.setFiles({ ...this.files, [path]: text });
      }

      return;
    }

    if (text !== this.text) {
      this.fileURIComponent.queue(text);
    }
  };

  /**
   * The file in the editor, as a path next to the entry.
   * Undefined for the entry.
   */
  @tracked activePath: string | undefined;

  /**
   * The files next to the entry, as path → text.
   */
  get files(): Record<string, string> {
    return this.fileURIComponent.files;
  }

  @tracked _filesOpen = readFilesOpen();

  /**
   * Until someone uses the toggle, the file list shows when there is more than one file.
   */
  get filesOpen() {
    return this._filesOpen ?? Object.keys(this.files).length > 0;
  }

  toggleFiles = () => {
    this._filesOpen = !this.filesOpen;
    writeFilesOpen(this._filesOpen);
  };

  /**
   * The compiler gives the entry this name, so relative imports resolve against it.
   */
  get entryName() {
    return `index.${infoFor(this.format).ext}`;
  }

  /**
   * Set by the editor modifier, like setCodemirrorState.
   */
  openDocument?: (key: string, text: string, format: string | undefined) => Promise<void>;
  forgetDocument?: (key: string) => void;

  /**
   * @param path undefined for the entry
   */
  openFile = (path?: string) => {
    this.activePath = path;

    if (path === undefined) {
      void this.openDocument?.('', this.text ?? '', editorFormatOf(this.format));

      return;
    }

    void this.openDocument?.(path, this.files[path] ?? '', editorFormatFor(path));
  };

  /**
   * @returns why the name is not allowed, if it is not
   */
  addFile = (rawPath: string, text = ''): string | undefined => {
    const path = normalizePath(rawPath);
    const problem = this.#problemWith(path);

    if (problem) return problem;

    this.fileURIComponent.setFiles({ ...this.files, [path]: text });
    this.openFile(path);
  };

  removeFile = (path: string) => {
    const next = { ...this.files };

    delete next[path];
    this.fileURIComponent.setFiles(next);
    this.forgetDocument?.(path);

    if (this.activePath === path) this.openFile(undefined);
  };

  /**
   * @returns why the name is not allowed, if it is not
   */
  renameFile = (from: string, rawTo: string): string | undefined => {
    const to = normalizePath(rawTo);

    if (to === from) return;

    const problem = this.#problemWith(to);

    if (problem) return problem;

    const next: Record<string, string> = {};

    for (const [path, text] of Object.entries(this.files)) {
      next[path === from ? to : path] = text;
    }

    this.fileURIComponent.setFiles(next);
    this.forgetDocument?.(from);

    if (this.activePath === from) this.openFile(to);
  };

  #problemWith(path: string): string | undefined {
    if (!path) return 'A file needs a name.';
    if (path.endsWith('/')) return 'A file name cannot end with a slash.';

    if (path.split('/').some((part) => part === '..' || part === '.')) {
      return 'A file must be inside the project.';
    }

    if (!editorFormatFor(path)) {
      return `${path} needs one of these extensions: ${FILE_EXTENSIONS.join(', ')}.`;
    }

    if (path === this.entryName) return `${path} is the entry file.`;
    if (path in this.files) return `${path} already exists.`;
  }

  /**
   * Puts the entry in the editor, with new text.
   */
  #showEntry(text: string, format: FormatQP) {
    if (this.activePath === undefined) {
      this.setCodemirrorState?.(text, editorFormatOf(format));

      return;
    }

    this.activePath = undefined;
    void this.openDocument?.('', text, editorFormatOf(format));
  }

  /**
   * A sample or a stored document is a new project.
   */
  #replaceFiles(files: Record<string, string>) {
    for (const path of Object.keys(this.files)) {
      this.forgetDocument?.(path);
    }

    if (Object.keys(this.files).length === 0 && Object.keys(files).length === 0) return;

    this.fileURIComponent.setFiles(files);
  }

  get text() {
    return this.fileURIComponent.decoded;
  }

  get format(): FormatQP {
    return this.fileURIComponent.format;
  }

  /**
   * Pinned npm package versions, from the `deps` query param.
   */
  get versions(): Versions {
    return parseDeps(this.router.currentRoute?.queryParams?.['deps']);
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
    return { text: this.text, format: this.format, versions: this.versions, files: this.files };
  }

  /**
   * The text, format, and versions for the output pane.
   */
  get renderInput(): RenderInput {
    return this.pausedFile ?? this.#file;
  }

  /**
   * Two Embers cannot share one page, so an ember-source pin
   * that is not the Ember of this app renders in a frame.
   */
  get rendersInFrame() {
    const pin = this.renderInput.versions['ember-source'];

    return pin !== undefined && pin !== VERSION;
  }

  /**
   * What the last output frame loaded, see PinnedOutput.
   */
  @tracked frameDependencies: ReadonlyMap<string, string | undefined> | undefined;

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

  /**
   * The text of the last document that the app loaded, before any edits.
   */
  #textAtSwitch: string | undefined;

  get didDocChange(): boolean {
    return this.text !== this.#textAtSwitch;
  }

  /**
   * For documents that the app picks, such as a sample.
   * `update` is for text that the user or the embedding page wrote.
   */
  load = (text: string, format: FormatQP, files: Record<string, string> = {}) => {
    this.#textAtSwitch = text;
    this.#replaceFiles(files);
    this.update(text, format);
  };

  /**
   * @param files undefined keeps the files there are
   */
  update = (
    text: string,
    format: FormatQP,
    qps?: Record<string, string>,
    files?: Record<string, string>
  ) => {
    // Update ourselves
    this.fileURIComponent.set(text, format, qps);

    if (files) this.fileURIComponent.setFiles(files);

    // Update the editor
    this.#showEntry(text, format);
  };

  updateFormat = (format: FormatQP) => {
    // Update ourselves
    this.fileURIComponent.set(this.text ?? '', format);

    // Update the editor
    this.#showEntry(this.text ?? '', format);
  };

  updateDemo = (text: string, demo: DemoEntry) => {
    const format = demo.format;

    this.#textAtSwitch = text;
    this.#replaceFiles({});

    // Update ourselves
    this.fileURIComponent.set(text, format, demo && 'qps' in demo ? demo.qps : {});

    // Update the editor
    this.#showEntry(text, format);
  };
}

// DO NOT DELETE: this is how TypeScript knows how to look up your services.
declare module '@ember/service' {
  interface Registry {
    editor: EditorService;
  }
}
