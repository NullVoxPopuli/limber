import Component from '@glimmer/component';
import { assert } from '@ember/debug';
import { guidFor } from '@ember/object/internals';

import { trackedFunction } from 'ember-resources/util/function';

type AllowedFormat = 'gjs' | 'gts' | 'hbs' | 'gmd';
type Storage = 'local' | 'url';

interface Signature {
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

export default class Code extends Component<Signature> {
  code = trackedFunction(this, async () => {
    if ('code' in this.args && this.args.code) {
      return this.args.code;
    }

    if ('path' in this.args) {
      let { path } = this.args;

      let response = await fetch(`/${path}`);
      let text = await response.text();

      return text;
    }

    assert(`either @path or @code must be passed to the Code/REPL component, but neither was.`);
  });

  get queryParams() {
    return wrap(this.code.value || '');
  }

  get lines() {
    return this.code.value?.split('\n')?.length ?? DEFAULT_NUMBER_OF_LINES;
  }

  get host() {
    if (window.location.host.includes('localhost')) {
      return 'http://localhost:4200';
    }

    return 'https://limber.glimdown.com/edit';
  }

  get title() {
    return this.args.title ?? guidFor(this.code);
  }
}

function wrap(code: string) {
  const params = new URLSearchParams();

  let sample = '' + code + '';

  params.set('t', sample);
  params.set('format', 'gjs');

  return params.toString();
}
