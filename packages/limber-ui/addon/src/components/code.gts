import Component from '@glimmer/component';
import { assert } from '@ember/debug';
import { guidFor } from '@ember/object/internals';
import { htmlSafe } from '@ember/template';
import { link } from 'ember-resources/link';

import { trackedFunction } from 'ember-resources/util/function';

type AllowedFormat = 'gjs' | 'gts' | 'hbs' | 'gmd';
type Storage = 'local' | 'url';

import { HostMessaging } from './frame-messaging';

interface Signature {
  Element: HTMLIFrameElement;
  Args:
    | {
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
      }
    /**
     * Example usage:
     *
     * <Code @path="templates-how-to/iterate/code/index.gjs" />
     */
    | {
        /**
         * local path on your asset host for where to load the code snippet file from.
         * This can be .gjs, .gts, .hbs, or .gmd
         */
        path: `${string}.${AllowedFormat}`;

        /**
         * The title of the snippet
         */
        title?: string;

        /**
         * Where to store in-progress content.
         * by default, the URL will be used -- but for larger documents,
         * local storage may be used instead.
         */
        storage?: Storage;
      };
}

const DEFAULT_NUMBER_OF_LINES = 7;
const HOST = 'https://limber.glimdown.com/edit';
const INITIAL_URL = `${HOST}?format=gjs&t=<template></template>`;

async function fetchFile(path: string) {
  let response = await fetch(`/${path}`);
  let text = await response.text();

  return text;
}

function defaultStyle(lines: number) {
  return `height: calc(1.5rem * ${lines});`;
}

export default class Code extends Component<Signature> {
  @link(HostMessaging) declare messaging: HostMessaging;

  code = trackedFunction(this, async () => {
    if ('code' in this.args && this.args.code) {
      return this.args.code;
    }

    if ('path' in this.args) {
      return fetchFile(this.args.path);
    }

    assert(`either @path or @code must be passed to the Code/REPL component, but neither was.`);
  });

  get lines() {
    return this.code.value?.split('\n')?.length ?? DEFAULT_NUMBER_OF_LINES;
  }

  get title() {
    return this.args.title ?? guidFor(this.code);
  }

  <template>
    <iframe
      {{this.messaging.postMessage this.code.value}}
      {{this.messaging.onMessage}}
      title={{this.title}}
      src={{INITIAL_URL}}
      style={{htmlSafe (defaultStyle this.lines)}}
      ...attributes
    >
    </iframe>

  </template>
}
