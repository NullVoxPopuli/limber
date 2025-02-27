// import { precompileJSON } from '@glimmer/compiler';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
// These things are pre-bundled in the old system.
// ember-template-compiler defines them in AMD/requirejs
import { precompileJSON } from '@glimmer/compiler';
import { getTemplateLocals } from '@glimmer/syntax';
import { setComponentTemplate } from '@ember/component';
import templateOnlyComponent from '@ember/component/template-only';
import { array, concat, fn, get, hash } from '@ember/helper';
import { on } from '@ember/modifier';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { createTemplateFactory } from '@ember/template-factory';

import { nameFor } from '../utils.ts';

import type { CompileResult } from '../types.ts';
import type { ComponentLike } from '@glint/template';

/**
 * compile a template with an empty scope
 * to use components, helpers, etc, you will need to compile with JS
 *
 * (templates alone do not have a way to import / define complex structures)
 */
export function compileHBS(template: string, options: CompileTemplateOptions = {}): CompileResult {
  const name = nameFor(template);
  let component: undefined | ComponentLike;
  let error: undefined | Error;

  try {
    component = setComponentTemplate(
      compileTemplate(template, { moduleName: options.moduleName || name, ...options }),
      templateOnlyComponent(options.moduleName || name)
    ) as ComponentLike;
  } catch (e) {
    error = e as Error | undefined;
  }

  return { name, component, error };
}

interface CompileTemplateOptions {
  /**
   * Used for debug viewing
   */
  moduleName?: string;
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
  const localScope = { array, concat, fn, get, hash, on, ...scope } as any;
  const locals = getTemplateLocals(source);

  const options = {
    strictMode: true,
    moduleName,
    locals,
    isProduction: false,
    meta: { moduleName },
  };

  // Copied from @glimmer/compiler/lib/compiler#precompile
  const [block, usedLocals] = precompileJSON(source, options);

  const usedScope = usedLocals.map((key: string) => {
    const value = localScope[key];

    if (!value) {
      throw new Error(
        `Attempt to use ${key} in compiled hbs, but it was not available in scope. ` +
          `Available scope includes: ${Object.keys(localScope)}`
      );
    }

    return value;
  });

  const blockJSON = JSON.stringify(block);
  const templateJSONObject = {
    id: moduleName,
    block: blockJSON,
    moduleName: moduleName ?? '(dynamically compiled component)',
    scope: () => usedScope,
    isStrictMode: true,
  };

  const factory = createTemplateFactory(templateJSONObject);

  return factory;
}
