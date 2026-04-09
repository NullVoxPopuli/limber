import Route from '@ember/routing/route';
import { getSettledState, settled } from '@ember/test-helpers';
import { getPendingWaiterState } from '@ember/test-waiters';

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

      const timeout = 30_000;
      const start = Date.now();
      const poll = setInterval(() => {
        const state = getSettledState();
        const elapsed = Date.now() - start;

        const waiterState = getPendingWaiterState();

        process.stderr.write(
          `[settled-debug] ${elapsed}ms: ${JSON.stringify(state)}\n`,
        );
        process.stderr.write(
          `[settled-debug] waiters: ${JSON.stringify(waiterState, null, 2)}\n`,
        );

        if (elapsed > timeout) {
          clearInterval(poll);
          process.stderr.write(
            `[settled-debug] Giving up after ${timeout}ms. Final state: ${JSON.stringify(state)}\n`,
          );
        }
      }, 2000);

      await settled();
      clearInterval(poll);

      return instance;
    },
  });

  return app;
}
