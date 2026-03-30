import Route from '@ember/routing/route';
import Router from '@ember/routing/router';

import PageTitleService from 'ember-page-title/services/page-title';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - no types
import Application from 'ember-strict-application-resolver';

/**
 * Minimal router for SSR — same route map as the main app
 * but without Embroider lazy bundles (everything is eagerly loaded).
 */
class SsrRouter extends Router {
  location = 'none' as const;
  rootURL = '/';
}

SsrRouter.map(function () {
  this.route('edit');
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

/**
 * Simplified application route for SSR.
 * Skips compiler/highlighter setup since docs pages are static content.
 */
class SsrApplicationRoute extends Route {}

export default class SsrApp extends Application {
  modules = {
    './router': SsrRouter,
    './routes/application': { default: SsrApplicationRoute },
    ...import.meta.glob('./templates/{application,error-404,docs}.gts', { eager: true }),
    ...import.meta.glob('./templates/docs/**/*.gts', { eager: true }),
    './services/page-title': PageTitleService,
  };
}

export function createSsrApp() {
  const g = globalThis as Record<string, unknown>;

  g.process ??= { env: {} };
  g.Buffer ??= {};

  return SsrApp.create({ autoboot: false });
}
