import Application from '@ember/application';
import Route from '@ember/routing/route';
import { settled } from '@ember/test-helpers';

import PageTitleService from 'ember-page-title/services/page-title';

import { customLayout } from './custom-layout.ts';
import Router from './router.ts';

/**
 * Simplified application route for SSR.
 * Skips compiler/highlighter setup since docs pages are static content.
 */
class SsrApplicationRoute extends Route {}

export default class SsrApp extends Application {
  modules = {
    './router': Router,
    ...customLayout(
      import.meta.glob('./routes/{application,error-404}/+template.gts', { eager: true })
    ),
    ...import.meta.glob('./templates/docs.gts', { eager: true }),
    ...import.meta.glob('./templates/docs/**/*.gts', { eager: true }),
    './routes/application': { default: SsrApplicationRoute },
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

      await settled();

      return instance;
    },
  });

  return app;
}
