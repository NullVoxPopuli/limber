import Route from '@ember/routing/route';
import { getSettledState, settled } from '@ember/test-helpers';

import PageTitleService from 'ember-page-title/services/page-title';
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

  const app = SsrApp.create({ autoboot: false });

  const originalVisit = app.visit.bind(app);

  Object.assign(app, {
    visit: async (...args: Parameters<typeof originalVisit>) => {
      const instance = await originalVisit(...args);

      (async () => {
        while (true) {
          console.log(getSettledState());
          await new Promise((r) => setTimeout(r, 5000));
        }
      })();

      await settled();

      return instance;
    },
  });

  return app;
}
