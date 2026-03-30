import Route from '@ember/routing/route';

import PageTitleService from 'ember-page-title/services/page-title';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - no types
import Application from 'ember-strict-application-resolver';

import Router from './router.ts';

/**
 * Simplified application route for SSR.
 * Skips compiler/highlighter setup since docs pages are static content.
 */
class SsrApplicationRoute extends Route {}

export default class SsrApp extends Application {
  modules = {
    './router': Router,
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
