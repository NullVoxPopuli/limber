/**
 * We can't use es-module-lexer because it wants syntatically valid
 * JavaScript.
 *
 * import { parse } from 'es-module-lexer';
 *
 * We may not have syntactically valid javascript,
 * but it's still useful to pull the imported modules into the
 * browser's module cache.
 */
//

import type { EvalImportMap } from './types.ts';

export async function resolveImportMap(doc: string, importMap?: EvalImportMap) {
  if (!importMap) {
    return {};
  }

  return importMap;

  // const [imports] = await parse(doc);
  //
  //
  // console.log(imports);

  // let result = {};

  // for (let [key, maybeFn] of Object.entries(importMap)) {
  //   if (typeof maybeFn === 'function') {
  //
  //   }
  // }

  // return result;
}
