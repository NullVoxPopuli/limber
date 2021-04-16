const CACHE_NAME = 'babel-compilation-and-module-service';
const URLS = [
  '/compile-sw',
  '/module-sw'
];

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
self.addEventListener('install',(event) => {
  // force moving on to activation even if another service worker had control
  self.skipWaiting();
});


self.addEventListener('activate', event => {
  // Claim any clients immediately, so that the page will be under SW control without reloading.
  event.waitUntil(self.clients.claim());
  console.log(`\
    Service Worker installed successfully!

    This service worker is used for compiling JavaScript
    and providing modules to the main thread.
  `);
});

const COMPILE_CACHE = new Map();

self.addEventListener('fetch', (event) => {
  event.respondWith(handleFetch(event));
});



async function handleFetch(event) {
  const url = new URL(event.request.url);

  console.log('handleFetch', url.pathname);
  if (!URLS.includes(url.pathname)) {
    return fetch(event.request);
  }

  switch (url.pathname) {
    case '/compile-sw': return compile(url);
    default:
      console.log(`Unhandled URL: ${url.pathname}`);
  }
}


function compile(url) {
    let qps = new URLSearchParams(url.search);
    let name = qps.get('n');
    let code = qps.get('q');
    let modulePath = `/module-sw/${name}.js`;

    // await cache.add(modulePath);
    console.log(`TODO: compile ${name}`);

    let response = new Response(JSON.stringify({ importPath: modulePath }), {
      headers: {
        'Content-Type': 'application/javascript',
      }
    });


    return response;
}

