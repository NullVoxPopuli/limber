const PREFIX_PROXY_MODULE = '/proxy-module/';

// const CACHE_NAME = 'babel-compilation-and-module-service';
const URLS = ['/compile.sw', '/module.sw'];

const COMPILE_CACHE = new Map();

export async function handleFetch(event: FetchEvent): Promise<Response> {
  // event.request.url is a string
  const url = new URL(event.request.url);

  /**
    * We only define two URL handlers,
    * - compile.sw - actually does compilation
    * - module.sw - loads what we compiled
    */
  if (!URLS.some((matcher) => url.pathname.startsWith(matcher))) {
    return fetch(event.request);
  }

  if (COMPILE_CACHE.has(url.pathname)) {
    return moduleResponse(url.pathname);
  }

  if (url.pathname === '/compile.sw') {
    return maybe(() => compile(event.request));
  }

  return error(`Unhandled URL: ${url.pathname}`);
}

async function maybe<Return>(op: () => Return | Promise<Return>) {
  try {
    return await op();
  } catch (e) {
    return error(e);
  }
}

function error(msg: unknown | string, status = 500) {
  let payload: string | Error | Record<string, unknown>;

  if (typeof msg === 'string') {
    payload = msg;
  } else if (msg instanceof TypeError) {
    payload = {
      ...msg,
      name: msg.name,
      message: msg.message,
      stack: msg.stack,
    };
  } else {
    payload = msg;
  }

  return new Response(JSON.stringify({ error: payload }), {
    status,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

function moduleResponse(pathName: string) {
  let code = COMPILE_CACHE.get(pathName);

  if (!code) {
    throw new Error(`Code has not been compiled. call /compile.sw with the code`);
  }

  return new Response(code, {
    headers: {
      'Content-Type': 'application/javascript',
    },
  });
}

async function compile(request: Request) {
  let body = await request.json();

  console.log(body);

  let { code, format } = body;

  if (!code) {
    throw new Error(`'code' property missing in body`);
  }

  if (!format) {
    throw new Error(`'format' property missing in body`);
  }

  let name = 'test-todo-generate-from-code';

  let modulePath = `/module.sw/${name}.js`;

  // TODO: all external imports must be changed 
  //       (via babel plugin (because we already have babel))
  //       to use https://esm.sh/*thePackage
  //
  // let compiled = await compileGJS({ name, code });

  // COMPILE_CACHE.set(modulePath, compiled);
  COMPILE_CACHE.set(modulePath, code);

  let response = new Response(JSON.stringify({
    importPath: modulePath,
    content: code,
  }), {
    headers: {
      'Content-Type': 'application/json',
    },
  });

  return response;
}
