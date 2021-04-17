import type { ExtractedCode } from './markdown-to-ember';

let isRegistered = false;

export async function compileJS(_id: string, js: ExtractedCode[]) {
  if (!isRegistered) {
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
