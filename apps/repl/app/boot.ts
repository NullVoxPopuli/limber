import { shouldRehydrate } from 'vite-ember-ssr/client';

import environment from '#config';

import Application from './app.ts';

if (shouldRehydrate()) {
  const app = Application.create({ ...environment.APP, autoboot: false });

  app.visit(window.location.pathname + window.location.search, {
    _renderMode: 'rehydrate',
  });
} else {
  Application.create(environment.APP);
}
