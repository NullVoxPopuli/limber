import { nameFor } from '../compile/utils.ts';

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
    payload = JSON.stringify(msg);
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
  let body: { code?: string, format?: string } = await request.json();

  let { code, format } = body;

  if (!code) {
    throw new Error(`'code' property missing in body`);
  }

  if (!format) {
    throw new Error(`'format' property missing in body`);
  }

  let name = nameFor(code + format, 'sw:named');

  let modulePath = `/module.sw/${name}.js`;

  // TODO: all external imports must be changed
  //       (via babel plugin (because we already have babel))
  //       to use https://esm.sh/*thePackage
  //
  //       https://esm.sh/#docs
  //
  // let compiled = await compileGJS({ name, code });
  //
  // TODO: only do this for import paths which have not already
  //       been declared by the local scope references
  let compiled = code.replaceAll(/from ('|")([^'"]+)('|")/g, function(_match, quote, moduleName, quote2) {
    let replacementModule = `https://esm.sh/*${moduleName}`;

    return `from ${quote}${replacementModule}${quote2}`;
  });

  COMPILE_CACHE.set(modulePath, compiled);

  let response = new Response(JSON.stringify({
    importPath: modulePath,
    content: compiled,
  }), {
    headers: {
      'Content-Type': 'application/json',
    },
  });

  return response;
}
