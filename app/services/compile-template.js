import { compileTemplate as _compileTemplate } from '@ember/template-compilation';
/**
 * Same API as in ember -- but with defaults specific to Limber
 * (and making the call site a little nicer so experimentation
 * can happen just in this file)
 */
export function compileTemplate(text, { moduleName }) {
  let compiled = _compileTemplate(text, {
    // https://github.com/emberjs/ember.js/blob/22bfcfdac0aeefcf333fb2d6697772934201b43b/packages/ember-template-compiler/lib/types.d.ts#L15
    // with strictMode, we'd need to import array, hash, and all that
    strictMode: false,
    locals: [],
    isProduction: false,
    moduleName,
    meta: {},
    plugins: {
      ast: [],
    },
    // customizeComponentName(/* tag */){}
  });

  return compiled;
}
