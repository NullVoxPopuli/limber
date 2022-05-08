import { handleFetch } from './fetch-handler';

const worker = self as unknown as ServiceWorkerGlobalScope;

/**
 * For a given glimdown document id, we will compile
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
 *  which will then turn in to (roughly):
 *
 *  for (let [name, importPath] of response) {
 *    let module = await import(importPath);
 *
 *    owner.register(`component:${name}`, module);
 *  }
 *
 *  and the <${name} /> will be swapped in to the ember
 *  variant of the glimdown for invocation
 *
 */
worker.addEventListener('install', () => {
  // force moving on to activation even if another service worker had control
  worker.skipWaiting();
});

worker.addEventListener('activate', (event) => {
  // Claim any clients immediately, so that the page will be under SW control without reloading.
  //
  // https://developer.mozilla.org/en-US/docs/Web/API/Clients/claim
  event.waitUntil(worker.clients.claim());
  console.info(`\
    Service Worker installed successfully!

    This service worker is used for compiling JavaScript
    and providing modules to the main thread.
  `);
});

worker.addEventListener('fetch', (event) => {
  event.respondWith(handleFetch(event));
});
