import EmbroiderRouter from '@embroider/router';

import { properLinks } from 'ember-primitives/proper-links';

import config from '#config';

@properLinks
export default class Router extends EmbroiderRouter {
  location = config.locationType;
  rootURL = config.rootURL;
}

/**
 * See: https://github.com/embroider-build/embroider/issues/2521
 */
function bundle(name: string, loader: () => Promise<{ default: unknown }>[]) {
  return {
    names: [name],
    load: async () => {
      const [template, route, controller] = await Promise.all(loader());
      const slashName = name.replaceAll('.', '/');
      const results: Record<string, unknown> = {};

      if (template) results[`./templates/${slashName}`] = template.default;
      if (route) results[`./routes/${slashName}`] = route.default;
      if (controller) results[`./controllers/${slashName}`] = controller.default;

      return {
        default: results,
      };
    },
  };
}

(window as any)._embroiderRouteBundles_ = [
  bundle('docs', () => [import('./templates/docs.gts')]),
  bundle('docs.index', () => [import('./templates/docs/index.gts')]),
  bundle('docs.repl-sdk', () => [import('./templates/docs/repl-sdk.gts')]),
  bundle('docs.ember-repl', () => [import('./templates/docs/ember-repl.gts')]),
  bundle('docs.embedding', () => [import('./templates/docs/embedding.gts')]),
  bundle('docs.editor', () => [import('./templates/docs/editor.gts')]),
  bundle('docs.related-projects', () => [import('./templates/docs/related-projects.gts')]),
];

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
    this.route('related-pprojects');
  });

  this.route('error-404', { path: '*' });
});
