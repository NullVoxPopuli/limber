import EmbroiderRouter from '@embroider/router';

import { properLinks } from 'ember-primitives/proper-links';

import config from '#config';

import type Owner from '@ember/owner';

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

const routeBundles = [
  bundle('docs', () => [import('./routes/docs/+template.gts')]),
  bundle('docs.index', () => [import('./routes/docs/index/+template.gts')]),
  bundle('docs.repl-sdk', () => [import('./routes/docs/repl-sdk/+template.gts')]),
  bundle('docs.ember-repl', () => [import('./routes/docs/ember-repl/+template.gts')]),
  bundle('docs.embedding', () => [import('./routes/docs/embedding/+template.gts')]),
  bundle('docs.editor', () => [import('./routes/docs/editor/+template.gts')]),
  bundle('docs.related', () => [import('./routes/docs/related/+template.gts')]),
];

(window as any)._embroiderRouteBundles_ = routeBundles;

type Bundle = (typeof routeBundles)[number];

interface LazyRouter {
  registerBundle(bundle: Bundle): Promise<void>;
}

/**
 * Loads the code of the lazy routes that a path enters.
 *
 *   /docs/editor → docs, docs.editor
 *   /docs        → docs, docs.index
 *
 * Rehydration needs this before the first render.
 * The router renders a route only after its code loads.
 * Until then, the outlet of that route is empty,
 * and rehydration deletes the prerendered content of that outlet.
 */
export function preloadRoutes(owner: Owner, path: string) {
  /**
   * The public router service has no API to load a lazy route.
   */
  // eslint-disable-next-line ember/no-private-routing-service
  const router: unknown = owner.lookup('router:main');
  const segments = path.split('/').filter(Boolean);
  const names = new Set<string>();
  let name = '';

  for (const segment of segments) {
    name = name ? `${name}.${segment}` : segment;
    names.add(name);
  }

  names.add(name ? `${name}.index` : 'index');

  const loads: Promise<void>[] = [];

  for (const bundle of routeBundles) {
    if (bundle.names.some((routeName) => names.has(routeName))) {
      loads.push((router as LazyRouter).registerBundle(bundle));
    }
  }

  return Promise.all(loads);
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
  this.route('docs', function () {
    this.route('repl-sdk');
    this.route('ember-repl');
    this.route('embedding');
    this.route('editor');
    this.route('related');
  });

  this.route('error-404', { path: '*' });
});
