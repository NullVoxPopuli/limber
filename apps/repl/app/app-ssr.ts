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
      import.meta.glob('./routes/{application,error-404,docs,docs/*}/+template.gts', {
        eager: true,
      })
    ),
    './routes/application': { default: SsrApplicationRoute },
    './services/page-title': PageTitleService,
  };
}

export function createSsrApp() {
  return SsrApp.create({ autoboot: false });
}

/**
 * FastBoot waits for this before it reads the page:
 * the docs highlight their code blocks after the first render.
 */
export { settled };
