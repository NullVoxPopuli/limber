import { preloadRoutes } from './router.ts';

import type Application from '@ember/application';

/**
 * Boots the app over the prerendered HTML of the current URL.
 *
 * This is `app.visit(url, { _renderMode: 'rehydrate' })`,
 * with the lazy routes of the URL loaded before the first render.
 */
export async function rehydrate(app: Application) {
  const options = { _renderMode: 'rehydrate' } as const;

  await app.boot();

  const instance = app.buildInstance();

  try {
    await instance.boot(options);
    await preloadRoutes(instance, window.location.pathname);
    await instance.visit(window.location.pathname + window.location.search);
  } catch (error) {
    instance.destroy();
    throw error;
  }
}
