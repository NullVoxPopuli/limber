import EmbroiderRouter from '@embroider/router';

import { properLinks } from 'ember-primitives/proper-links';

import config from '#config';

import { lazyRouteBundles } from './custom-layout.ts';

@properLinks
export default class Router extends EmbroiderRouter {
  location = config.locationType;
  rootURL = config.rootURL;
}

/**
 * See: https://github.com/embroider-build/embroider/issues/2521
 */
(window as any)._embroiderRouteBundles_ = lazyRouteBundles(
  import.meta.glob('./routes/docs/**/+{route,template,controller}.{ts,gts}')
);

Router.map(function () {
  /**
   * The main editing UI is here
   */
  this.route('edit');

  /**
   * These top-level views are only meaningful via iframe
   * or very carefully crafted URLS
   */
  this.route('ember');
  this.route('output');
  this.route('docs', function () {
    this.route('repl-sdk');
    this.route('ember-repl');
    this.route('embedding');
    this.route('editor');
    this.route('related');
  });

  this.route('error-404', { path: '*' });
});
