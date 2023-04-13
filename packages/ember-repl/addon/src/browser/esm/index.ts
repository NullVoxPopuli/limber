import { preprocess, transform } from '../gjs';
import { modules } from '../known-modules';
import { nameFor } from '../utils';

import type { ExtraModules } from '../types';
import type Component from '@glimmer/component';

export interface Info {
  code: string;
  name: string;
}

export async function compileJS(code: string, extraModules?: ExtraModules) {
  let name = nameFor(code);
  let component: undefined | unknown;
  let error: undefined | Error;

  try {
    let compiled = await compileGJS({ code: code, name });

    if (!compiled) {
      throw new Error(`Compiled output is missing`);
    }

    // NOTE: we cannot `eval` ESM
    compiled = proxyToSkypack(compiled, extraModules);
    component = await evalSnippet(compiled);
  } catch (e) {
    error = e as Error | undefined;
  }

  return { name, component, error };
}

export function proxyToSkypack(code: string, extraModules?: ExtraModules) {
  let knownModules = [...Object.keys(extraModules || {}), ...Object.keys(modules)];
  let origin = location.origin;

  let result = code.replaceAll(/from ('|")([^"']+)('|")/g, (_, __, modulePath) => {
    if (knownModules.includes(modulePath)) {
      return `from '${origin}/${modulePath}'`;
    }

    return `from 'https://cdn.skypack.dev/${modulePath}'`;
  });

  return result;
}

async function evalSnippet(code: string) {
  let encodedJs = encodeURIComponent(code);
  let result = await import(
    /* webpackIgnore: true */ `data:text/javascript;charset=utf-8,${encodedJs}`
  );

  if (!result.default) {
    throw new Error(`Expected module to have a default export, found ${Object.keys(result)}`);
  }

  return result as {
    default: Component;
    services?: { [key: string]: unknown };
  };
}

async function compileGJS({ code: input, name }: Info) {
  let preprocessed = preprocess(input, name);
  let result = await transform(preprocessed, name, {
    modules: false,
  });

  if (!result) {
    return;
  }

  let { code } = result;

  return code;
}
