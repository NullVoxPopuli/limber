import { handleFetch } from './fetch-handler.ts';

// Silly Workers
export type { };
declare const self: ServiceWorkerGlobalScope;

/**
 * For a given markdown document id, we will compile
 * N components within that glimdown, and return an object
 * map of an arbitrary name of the default export to the URL
 * for which the module may be imported from.
 *
 * Since the set of modules is uniqueish to the glimdown
 * document id, we'll try to keep a history of 10 most recent
 * compiles, so that quick edits don't need to do extra work
 *
 * example:
 *
 *  POST /compile.sw
 *    id: gmd.id,
 *    components: [{ name: string, code: string }]
 *
 *   =>
 *
 *  {
 *    [name] => "url/to/import"
 *  }
 *
 *
 */
self.addEventListener('install', () => {
  // force moving on to activation even if another service worker had control
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  // Claim any clients immediately, so that the page will be under SW control without reloading.
  const claim = self.clients.claim();
  event.waitUntil(claim);

  console.info(`\
    Service Worker installed successfully!

    This service worker is used for compiling JavaScript
    and providing modules to the main thread.
  `);
});


self.addEventListener("fetch", (event) => {
  event.respondWith(handleFetch(event));
});

