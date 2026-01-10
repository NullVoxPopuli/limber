/* eslint-disable @typescript-eslint/no-explicit-any */
import './code.css';

import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { on } from '@ember/modifier';
import { guidFor } from '@ember/object/internals';
import { htmlSafe } from '@ember/template';

import { link } from 'reactiveweb/link';

import type Owner from '@ember/owner';

type AllowedFormat =
  | 'gjs'
  | 'gts'
  | 'hbs'
  | 'gmd'
  | 'vue'
  | 'svelte'
  | 'mermaid';
// type Storage = 'local' | 'url';

import { HostMessaging } from './frame-messaging.ts';

const DEFAULT_DEMO = `
// Welcome
//
// Whatever is export-defaulted is what is rendered
<template>
  hello world!
</template>
`;

interface Signature {
  Element: HTMLIFrameElement;
  Args: {
    /**
     * This is the code that both shows up in the editor and is rendered in the output pane. By default the format is gjs, so the passed code should be written in gjs.
     */
    code: string;

    /**
     * This is the format that the REPL should both render and load the editor for. The default is "gjs", but valid options are:
     * - gjs
     * - js
     * - gmd
     * - svelte
     * - vue
     * - mermaid
     * - hbs|ember
     * - jsx|react
     */
    format?: AllowedFormat;

    /**
     * Sets the height of the iframe via specifying the number of lines of code to show.
     */
    lines?: number;

    /**
     * Sets the `title` attribute on the iframe. If `@title` is not passed, this value will be generated for you. Helps with screen readers.
     */
    title?: string;

    /**
     * By default, the REPL will load when its bounding box approaches the viewport ([via `loading=lazy`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/iframe#lazy)). Setting `@clickToLoad` will require user interaction before _rendering_ the iframe.
     *
     * The UI for click to load has stable CSS classes available for customization.
     *
     * - `.limber__code__click-to-load`
     * - `.limber__code__click-to-load__button`
     */
    clickToLoad?: boolean;

    /**
     * Where to store in-progress content.
     * by default, the URL will be used -- but for larger documents,
     * local storage may be used instead.
     */
    // TODO: implement
    // storage?: Storage;

    /**
     * Set the editor size and/or split. For example passing `min` will minimize the editor, and passing `max` will maximize the editor. Also, the percent of the vertical or horizontal direction can be specified as well. For example, passing `60v` will cause a vertical split where the editor takes up 60% of the available space and `30h` will cause a horizontal split where the editor takes up 30% of the available space.
     */
    editor?: string;
    /**
     * Determines how the editor should load. Normally the editor will load automatically upon detecting interaction activity. This is to optimize page-load as editors can be a few MB when fully featured.
     *
     * Valid options:
     * - "force" - the editor will always load eagerly
     * - "onclick" - the editor will only load when the user clicks that they want to edit the example
     *   - "never" - the editor is entirely disabled and the left-hand side is only a highlighted code snippet as is not editable
     */
    editorLoad?: 'force' | 'onclick' | 'never';

    /**
     * If set to true, the preview code shown before the editor loads will not have highlighting enabled. This option has no affect when the editor is forced to eagerly load.
     */
    nohighlight?: 'false' | 'true' | '0' | '1';

    /**
     * Sets whether or not the output area should be rendered within a shadow-dom. The default is to render the output in a shadow-dom (true).
     *
     * Changing this can be helpful if importing a library only knows how to mutate the document's head (for styles or otherwise)
     */
    shadowdom?: 'false' | 'true' | '0' | '1';
  };
}

const DEFAULT_NUMBER_OF_LINES = 7;
const HOST = 'https://limber.glimdown.com/edit';

/**
 * NOTE: updates the the `src` URL do not update the iframe
 */
const INITIAL_URL = (options: Record<string, any>): string => {
  const { code, editor, shadowdom, nohighlight, format, editorLoad } = options;

  const initialQPs = new URLSearchParams(window.location.search);
  const local = initialQPs.get('local');
  const host = initialQPs.has('local')
    ? `https://localhost:${local || '4201'}/edit`
    : HOST;

  return (
    `${host}?` +
    (editorLoad ? `&editorLoad=${editorLoad}` : '') +
    (editor ? `&editor=${editor}` : '') +
    (shadowdom ? `&shadowdom=${shadowdom}` : '') +
    (format ? `&format=${format}` : '&format=BUG:MISSING') +
    (nohighlight ? `&nohighlight=${nohighlight}` : '') +
    (local ? `&local` : '') +
    (code ? `&t=${encodeURIComponent(code as string)}` : DEFAULT_DEMO)
  );
};

function defaultStyle(lines: number) {
  return `height: calc(1.5rem * ${lines});`;
}

export default class Code extends Component<Signature> {
  @link(HostMessaging) declare messaging: HostMessaging;

  @tracked manualLoad = false;

  initialData: Record<string, any>;

  constructor(owner: Owner, args: Signature['Args']) {
    super(owner, args);

    this.initialData = {
      editorLoad: this.args.editorLoad,
      editor: this.args.editor,
      nohighlight: this.args.nohighlight,
      shadowdom: this.args.shadowdom,
      code: this.code,
      format: this.format,
    };
  }

  get load() {
    if (this.args.clickToLoad) {
      return this.manualLoad;
    }

    return true;
  }

  get code() {
    if ('code' in this.args) {
      return this.args.code;
    }

    return '';
  }

  get format() {
    if ('format' in this.args) {
      return this.args.format ?? 'gjs';
    }

    return 'gjs';
  }

  get lines() {
    return (
      this.args.lines ??
      this.code?.split('\n')?.length ??
      DEFAULT_NUMBER_OF_LINES
    );
  }

  get title() {
    return this.args.title ?? guidFor(this.code);
  }

  get liveData() {
    return {
      code: this.code,
      format: this.format,
      shadowdom: this.args.shadowdom,
    };
  }

  triggerLoad = () => {
    this.manualLoad = true;
  };

  /**
   * This uses iframe postMessage to efficiently update state within the
   * iframe's app so that we don't have to reload the whole app if we want to change the
   * URL / code.
   */
  <template>
    {{#if this.load}}
      <iframe
        loading="lazy"
        data-lines="{{this.lines}}"
        {{this.messaging.postMessage this.liveData}}
        {{this.messaging.onMessage}}
        title={{this.title}}
        src={{htmlSafe (INITIAL_URL this.initialData)}}
        style={{htmlSafe (defaultStyle this.lines)}}
        ...attributes
      >
      </iframe>
    {{else}}
      <div class="limber__code__click-to-load">
        <button
          class="limber__code__click-to-load__button"
          type="button"
          {{on "click" this.triggerLoad}}
        >
          Click to Load REPL
        </button>
      </div>
    {{/if}}
  </template>
}
