import './code.css';

import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { on } from '@ember/modifier';
import { guidFor } from '@ember/object/internals';
import { htmlSafe } from '@ember/template';

import { link } from 'reactiveweb/link';

type AllowedFormat = 'gjs' | 'gts' | 'hbs' | 'gmd' | 'vue' | 'svelte' | 'mermaid';
type Storage = 'local' | 'url';

import { HostMessaging } from './frame-messaging.ts';

interface Signature {
  Element: HTMLIFrameElement;
  Args: {
    /**
     * Don't load the iframe contents until the user
     * confirms that they want to
     */
    clickToLoad?: boolean;

    /**
     * code-snippet to use
     */
    code: string;
    /**
     * The title of the snippet
     */
    title?: string;

    /**
     * Set the height of the iframe in lines
     */
    lines?: number;

    /**
     * What kind of file the `code` should be interpreted as.
     */
    format: AllowedFormat;

    /**
     * Where to store in-progress content.
     * by default, the URL will be used -- but for larger documents,
     * local storage may be used instead.
     */
    storage?: Storage;

    /**
     *
     */
    editor?: string;
    editorLoad?: 'force' | 'onclick' | 'never';
  };
  /**
   * Example usage:
   *
   * <Code @path="templates-how-to/iterate/code/index.gjs" />
   */
  // | {
  //     /**
  //      * local path on your asset host for where to load the code snippet file from.
  //      * This can be .gjs, .gts, .hbs, or .gmd
  //      */
  //     path: `${string}.${AllowedFormat}`;

  //     /**
  //      * Where to store in-progress content.
  //      * by default, the URL will be used -- but for larger documents,
  //      * local storage may be used instead.
  //      */
  //     storage?: Storage;
  //   };
}

const DEFAULT_NUMBER_OF_LINES = 7;
const HOST = 'https://limber.glimdown.com/edit';

/**
 * NOTE: updates the the `src` URL do not update the iframe
 */
const INITIAL_URL = (options: Record<string, string | boolean | number>): string => {
  const { code, editor, shadowdom, nohighlight, format, editorLoad } = options;

  const initialQPs = new URLSearchParams(window.location.search);
  const local = initialQPs.get('local');
  const host = initialQPs.has('local') ? `https://localhost:${local || '4201'}/edit` : HOST;

  console.log({ code });

  return (
    `${host}?t=<template></template>` +
    (editorLoad ? `&editorLoad=${editorLoad}` : '') +
    (editor ? `&editor=${editor}` : '') +
    (shadowdom ? `&shadowdom=${shadowdom}` : '') +
    (format ? `&format=${format}` : 'BUG:MISSING') +
    (nohighlight ? `&nohighlight=${nohighlight}` : '') +
    (local ? `&local` : '') +
    (code ? `&t=${encodeURIComponent(code as string)}` : '')
  );
};

function defaultStyle(lines: number) {
  return `height: calc(1.5rem * ${lines});`;
}

export default class Code extends Component<Signature> {
  @link(HostMessaging) declare messaging: HostMessaging;

  @tracked manualLoad = false;

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
      return this.args.format;
    }

    return 'gjs';
  }

  get lines() {
    return this.args.lines ?? this.code?.split('\n')?.length ?? DEFAULT_NUMBER_OF_LINES;
  }

  get title() {
    return this.args.title ?? guidFor(this.code);
  }

  get liveData() {
    return {
      code: this.code,
      format: this.format,
    };
  }

  get initialData() {
    return {
      editorLoad: this.args.editorLoad,
      editor: this.args.editor,
      nohighlight: this.args.nohighlight,
      shadowdom: this.args.shadowdom,
      code: this.code,
      format: this.format,
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
