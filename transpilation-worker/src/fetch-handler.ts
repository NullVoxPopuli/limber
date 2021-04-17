import { compileGJS } from './babel';

// const CACHE_NAME = 'babel-compilation-and-module-service';
const URLS = ['/compile-sw', /^\/module-sw\//];

const COMPILE_CACHE = new Map();

export async function handleFetch(event: FetchEvent): Promise<Response> {
  const url = new URL(event.request.url);

  console.info('handleFetch', url.pathname);

  if (!URLS.some((matcher) => url.pathname.match(matcher))) {
    return fetch(event.request);
  }

  if (COMPILE_CACHE.has(url.pathname)) {
    return moduleResponse(url.pathname);
  }

  if (url.pathname === '/compile-sw') {
    return maybe(() => compile(url));
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

function error(msg: Error | string, status = 500) {
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
    throw new Error(`Code has not been compiled. call /compile-sw with the code`);
  }

  return new Response(code, {
    headers: {
      'Content-Type': 'application/javascript',
    },
  });
}

async function compile(url: URL) {
  let qps = new URLSearchParams(url.search);
  let name = qps.get('n');
  let code = qps.get('q');
  let modulePath = `/module-sw/${name}.js`;

  if (!name || !code) {
    throw new Error(
      `Both name and code are required. Make sure than the n and q query params are specified`
    );
  }

  let compiled = await compileGJS({ name, code });

  COMPILE_CACHE.set(modulePath, compiled);

  let response = new Response(JSON.stringify({ importPath: modulePath }), {
    headers: {
      'Content-Type': 'application/json',
    },
  });

  return response;
}
