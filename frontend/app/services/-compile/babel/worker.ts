import type { ExtractedCode } from '../markdown-to-ember';

let isRegistered = false;

class CompileError extends Error {
  constructor(
    public message: string,
    public response: Response,
    public code: string,
    public url: string
  ) {
    super(message);
  }
}

export async function compile(js: ExtractedCode) {
  if (!isRegistered) {
    // await installImportMap();
    await setupServiceWorker();
    await establishRequireJSEntries();

    isRegistered = true;
  }

  let { name, code } = js;

  let qps = new URLSearchParams();

  qps.set('n', name);
  qps.set('q', code);

  let url = `/compile-sw?${qps}`;

  let response = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
  });

  if (response.status !== 200) {
    throw new CompileError(
      `${response.status} | Could not compile code. See console for details.`,
      response,
      code,
      url
    );
  }

  let { importPath } = await response.json();

  return { name, importPath };
}

// async function installImportMap() {
//   let script = document.createElement('script');

//   script.setAttribute('type', 'importmap');

//   // let response = await import(
//   //   /* webpackIgnore: true */
//   //   'https://raw.githubusercontent.com/ef4/mho/a4391e53891f3f6321f0a8f36de88ec23511dbee/ember-app/importmap.json'
//   // );
//   // External Import maps are not supported yet
//   // let response = await fetch(
//   //   'https://raw.githubusercontent.com/ef4/mho/a4391e53891f3f6321f0a8f36de88ec23511dbee/ember-app/importmap.json'
//   // );
//   // let importmap = await response.text();
//   // eslint-disable-next-line @typescript-eslint/ban-ts-comment
//   // @ts-ignore
//   let importmap = (await import('/mho-importmap.json')).default;

//   console.debug({ importmap });

//   script.innerHTML = JSON.stringify(importmap);
//   document.body.appendChild(script);
// }

async function setupServiceWorker() {
  if ('serviceWorker' in navigator) {
    let registration = await navigator.serviceWorker.register('/transpile.js');

    registration.update();

    console.info('ServiceWorker registration successful with scope: ', registration.scope);

    await new Promise((resolve) => {
      let interval = setInterval(() => {
        if (registration.active?.state === 'activated') {
          clearInterval(interval);
          resolve(null);
        }
      }, 50);
    });

    console.info('ServiceWorker activated.');

    return registration;
  }

  throw new Error(`ServiceWorker is required`);
}

async function establishRequireJSEntries() {
  await fetch('/populate-sw', {
    method: 'POST',
    // Require JS is private API, but we need to swap out imports in the code
    // snippets for accessing the same requirejs modules that are in this app.
    //
    // This is to
    // - reduce overall shipped JS
    //
    // However, if we were to make the rendering area an entirely different app,
    // we could then isolate compile errors and not have fatal problems that require
    // a browser page refresh -- this may be the best thing to do in the long term.
    //
    // But for now, we need to at least try the requirejs stuff, because it's a requirement
    // for design-system REPLs
    //
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    body: JSON.stringify(Object.keys((window.requirejs as any).entries)),
    headers: {
      'Content-Type': 'application/json',
    },
  });
}
