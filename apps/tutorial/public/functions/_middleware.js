export async function onRequest(context) {
  try {
    return errorIfNotFound(context);
  } catch (err) {
    return new Response(`${err.message}\n${err.stack}`, { status: 500 });
  }
}

async function errorIfNotFound(context) {
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

  let defaultResponse = await next();

  /**
    * Cloudflare (because of how single-page-apps work)
    * returns our index.html as a 200 whenever any URL is requested.
    * Normally this is good, but because we have file extensions
    * in our URLs, we *only* want to return those files.
    * Not the index HTML
    */
  if (defaultResponse.status === 200) {
    console.log(defaultResponse.headers);
    let headers = defaultResponse.headers;
    let body = defaultResponse.clone();

    /**
      * We return a 404
      */
    if (headers.get('content-type') === 'text/html') {
      return new Response(JSON.stringify({
        'intercepted-by': 'public/functions/_middleware.js',
      }), {
        status: 404,
      });
    }
  }


  return defaultResponse;

}
