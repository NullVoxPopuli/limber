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
     * When true, forces the editor to load immediately.
     */
    editor?: boolean;
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
  //      * The title of the snippet
  //      */
  //     title?: string;

  //     /**
  //      * Where to store in-progress content.
  //      * by default, the URL will be used -- but for larger documents,
  //      * local storage may be used instead.
  //      */
  //     storage?: Storage;
  //   };
}

const DEFAULT_NUMBER_OF_LINES = 7;
// TODO: allow import.meta.env to override this
let HOST = 'https://limber.glimdown.com/edit';

const initialQPs = new URLSearchParams(window.location.search);

if (initialQPs.get('local')) {
  HOST = `http://localhost:${initialQPs.get('local')}`;
}

/**
 * NOTE: updates the the `src` URL do not update the iframe
 */
const INITIAL_URL = (options: Record<string, string | boolean | number>): string => {
  const { code, editor, shadowdom, nohighlight, format, editorLoad } = options;

  return (
    `${HOST}?format=gjs&t=<template></template>` +
    (editorLoad ? `&editorLoad=${editorLoad}` : '') +
    (editor ? `&editor=${editor}` : '') +
    (shadowdom ? `&shadowdom=${shadowdom}` : '') +
    (format ? `&format=${format}` : '') +
    (nohighlight ? `&nohighlight=${nohighlight}` : '') +
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

  get lines() {
    return this.args.lines ?? this.code?.split('\n')?.length ?? DEFAULT_NUMBER_OF_LINES;
  }

  get title() {
    return this.args.title ?? guidFor(this.code);
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
        {{this.messaging.postMessage this.code}}
        {{this.messaging.onMessage}}
        title={{this.title}}
        src={{htmlSafe (INITIAL_URL this.args)}}
        style={{htmlSafe (defaultStyle this.lines)}}
        ...attributes
      >
      </iframe>
    {{else}}
      <div class="limber__code__click-to-load">
        <button
          class="limber__code__click-to-load__button"
          {{on "click" this.triggerLoad}}
        >
          Click to Load REPL
        </button>
      </div>
    {{/if}}
  </template>
}
