import fs from 'node:fs/promises';

export async function onRequest(context) {
  try {
    return errorIfNotFound(context);
  } catch (err) {
    return new Response(`${err.message}\n${err.stack}`, { status: 500 });
  }
}

function errorIfNotFound(context) {
  const { request, next } = context;
  const url = new URL(request.url);

  /**
    * If the extension ends with gjs
    * or md, we check disk.
    * otherwise we fallback to default behavior.
    */
  let isGJS = url.pathname.endsWith('.gjs');
  let isGTS = url.pathname.endsWith('.gts');
  let isMD = url.pathname.endsWith('.md');

  let shouldCheck = isGJS || isGTS || isMD;

  if (!shouldCheck) {
    // let Cloudflare do its thing
    return await next();
  }


}
