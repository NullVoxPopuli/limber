import Component from '@glimmer/component';
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
     * code-snippet to use
     */
    code: string;
    /**
     * The title of the snippet
     */
    title?: string;
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

const INITIAL_URL = (force?: boolean) =>
  `${HOST}?format=gjs&t=<template></template>` + (force ? `&forceEditor=${force}` : '');

function defaultStyle(lines: number) {
  return `height: calc(1.5rem * ${lines});`;
}

export default class Code extends Component<Signature> {
  @link(HostMessaging) declare messaging: HostMessaging;

  get code() {
    if ('code' in this.args) {
      return this.args.code;
    }

    return '';
  }

  get lines() {
    return this.code?.split('\n')?.length ?? DEFAULT_NUMBER_OF_LINES;
  }

  get title() {
    return this.args.title ?? guidFor(this.code);
  }

  /**
   * This uses iframe postMessage to efficiently update state within the
   * iframe's app so that we don't have to reload the whole app if we want to change the
   * URL / code.
   */
  <template>
    <iframe
      {{this.messaging.postMessage this.code}}
      {{this.messaging.onMessage}}
      title={{this.title}}
      src={{htmlSafe (INITIAL_URL @editor)}}
      style={{htmlSafe (defaultStyle this.lines)}}
      ...attributes
    >
    </iframe>
  </template>
}
