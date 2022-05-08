import type { ExtractedCode } from '../markdown-to-ember';

let isRegistered = false;

class CompileError extends Error {
  constructor(public message: string, public response: Response, public code: string, public url: string) {
    super(message);
  }
}

export async function compile(js: ExtractedCode) {
  if (!isRegistered) {
    // await installImportMap();
    await setupServiceWorker();

    isRegistered = true;
  }

  await new Promise(resolve => setTimeout(resolve, 5000));

  let { name, code } = js;

  let qps = new URLSearchParams();

  qps.set('n', name);
  qps.set('q', code);

  let url = `/compile-sw?${qps}`;

  let response = await fetch(url);
  if (response.status !== 200) {
    throw new CompileError(`${response.status} | Could not compile code. See console for details.`, response, code, url);
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
    let registration = await navigator.serviceWorker.register('/transpilation/limber-worker.js')

    registration.update();

    console.info('ServiceWorker registration successful with scope: ', registration.scope);

    await new Promise((resolve) => {
      let interval = setInterval(() => {
        console.log(registration?.active?.state);

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
