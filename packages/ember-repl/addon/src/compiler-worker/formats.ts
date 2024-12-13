import type { CompileResult, EvalImportMap } from '../types.ts';

export async function compileGJS(
  gjsInput: string,
  importMap?: EvalImportMap
): Promise<CompileResult> {
  try {
    let { compileJS } = await import('./formats/gjs/index.ts');

    // let importMap2 = await resolveImportMap(gjsInput, importMap);
    //
    // console.log(importMap2);

    return await compileJS(gjsInput, importMap);
  } catch (error) {
    return { error: error as Error, name: 'unknown' };
  }
}

export async function compileHBS(
  hbsInput: string,
  options?: {
    moduleName?: string;
    scope?: Record<string, unknown>;
  }
): Promise<CompileResult> {
  try {
    let { compileHBS } = await import('./formats/hbs.ts');

    return compileHBS(hbsInput, options);
  } catch (error) {
    return { error: error as Error, name: 'unknown' };
  }
}
