import type { ExtractedCode } from '../markdown-to-ember';

let isRegistered = false;

export async function compile(js: ExtractedCode[]) {
  let moduleInfos = await compileModules(js);

  let missing = moduleInfos.filter(({ importPath }) => !importPath);

  if (missing.length > 0) {
    let first = missing[0];

    throw new Error(`Component, ${first.name}, failed to compile`);
  }

  return moduleInfos;
}

export async function compileModules(js: ExtractedCode[]) {
  if (!isRegistered) {
    await installImportMap();
    await setupServiceWorker();

    isRegistered = true;
  }

  let responses = await Promise.all(
    js.map(async ({ name, code }) => {
      let qps = new URLSearchParams();

      qps.set('n', name);
      qps.set('q', code);

      let response = await fetch(`/compile-sw?${qps}`);
      let { importPath } = await response.json();

      return { name, importPath };
    })
  );

  return responses;
}

async function installImportMap() {
  let script = document.createElement('script');

  script.setAttribute('type', 'importmap');
  // let response = await import(
  //   /* webpackIgnore: true */
  //   'https://raw.githubusercontent.com/ef4/mho/a4391e53891f3f6321f0a8f36de88ec23511dbee/ember-app/importmap.json'
  // );
  // External Import maps are not supported yet
  // let response = await fetch(
  //   'https://raw.githubusercontent.com/ef4/mho/a4391e53891f3f6321f0a8f36de88ec23511dbee/ember-app/importmap.json'
  // );
  // let importmap = await response.text();
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  let importmap = (await import('/mho-importmap.json')).default;

  console.debug({ importmap });

  script.innerHTML = JSON.stringify(importmap);
  document.body.appendChild(script);
}

async function setupServiceWorker() {
  if ('serviceWorker' in navigator) {
    let registration = await navigator.serviceWorker.register('/transpilation-worker.js');

    // registration.update();

    console.info('ServiceWorker registration successful with scope: ', registration.scope);

    await new Promise((resolve) => {
      let interval = setInterval(() => {
        if (registration.active?.state === 'activated') {
          clearInterval(interval);
          resolve(null);
        }
      }, 50);
    });

    return registration;
  }

  throw new Error(`ServiceWorker is required`);
}
