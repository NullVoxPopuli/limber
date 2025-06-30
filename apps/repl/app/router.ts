import EmberRouter from '@embroider/router';

import { properLinks } from 'ember-primitives/proper-links';

import config from '#config';

@properLinks
export default class Router extends EmberRouter {
  location = config.locationType;
  rootURL = config.rootURL;
}

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

  this.route('error', { path: '*' });
});
