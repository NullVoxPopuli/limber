/* eslint-disable @typescript-eslint/no-explicit-any */
// import { precompileJSON } from '@glimmer/compiler';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { setComponentTemplate } from '@ember/component';
import templateOnlyComponent from '@ember/component/template-only';
import { array, concat, fn, get, hash } from '@ember/helper';
import { on } from '@ember/modifier';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { createTemplateFactory } from '@ember/template-factory';
import { importSync } from '@embroider/macros';

import { nameFor } from './utils';

// These things are pre-bundled in the old system.
// ember-template-compiler defines them in AMD/requirejs
const { precompileJSON } = importSync('@glimmer/compiler') as any;
const { getTemplateLocals } = importSync('@glimmer/syntax') as any;

/**
 * compile a template with an empty scope
 * to use components, helpers, etc, you will need to compile with JS
 *
 * (templates alone do not have a way to import / define complex structures)
 */
export function compileHBS(
  template: string,
  options: Partial<CompileTemplateOptions> = {}
) {
  let name = options.moduleName ?? nameFor(template);
  let component: undefined | unknown;
  let error: undefined | Error;

  try {
    component = setComponentTemplate(
      compileTemplate(template, { ...options, moduleName: name }),
      templateOnlyComponent(name)
    );
  } catch (e) {
    error = e as Error | undefined;
  }

  return { name, component, error };
}

interface CompileTemplateOptions {
  moduleName: string;
  scope?: Record<string, unknown>;
}

/**
 * The reason why we can't use precompile directly is because of this:
 * https://github.com/glimmerjs/glimmer-vm/blob/master/packages/%40glimmer/compiler/lib/compiler.ts#L132
 *
 * Support for dynamically compiling templates in strict mode doesn't seem to be fully their yet.
 * That JSON.stringify (and the lines after) prevent us from easily setting the scope function,
 * which means that *everything* is undefined.
 */
function compileTemplate(source: string, { moduleName, scope = {} }: CompileTemplateOptions) {
  let localScope = { array, concat, fn, get, hash, on, ...scope } as any;
  let locals = getTemplateLocals(source);

  let options = {
    strictMode: true,
    moduleName,
    locals,
    isProduction: false,
    meta: { moduleName },
  };

  // Copied from @glimmer/compiler/lib/compiler#precompile
  let [block, usedLocals] = precompileJSON(source, options);

  let usedScope = usedLocals.map((key: string) => localScope[key]);

  let blockJSON = JSON.stringify(block);
  let templateJSONObject = {
    id: moduleName,
    block: blockJSON,
    moduleName: moduleName ?? '(unknown template module)',
    scope: () => usedScope,
    isStrictMode: true,
  };

  let factory = createTemplateFactory(templateJSONObject);

  return factory;
}
