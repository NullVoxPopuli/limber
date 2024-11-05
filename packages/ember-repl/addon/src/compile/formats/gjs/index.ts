import babelPluginEmberTemplateCompilation from 'babel-plugin-ember-template-compilation';
import * as compiler from 'ember-template-compiler';

import { nameFor } from '../../utils.ts';
import { evalSnippet } from './eval.ts';

import type { CompileResult } from '../../types.ts';
import type { ComponentLike } from '@glint/template';

export interface Info {
  code: string;
  name: string;
}

/**
 * @public
 * Transpiles GlimmerJS (*.gjs) formatted text into and evaluates as a JS Module.
 * The returned component can be invoked explicitly in the consuming project.
 *
 * SEE: README for example usage
 *
 * @param {string} code: the code to be compiled
 * @param {Object} extraModules: map of import paths to modules. This isn't needed
 *  for classic ember projects, but for strict static ember projects, extraModules
 *  will need to be pasesd if compileJS is intended to be used in a styleguide or
 *  if there are additional modules that could be imported in the passed `code`.
 *
 *  Later on, imports that are not present by default (ember/glimmer) or that
 *  are not provided by extraModules will be searched on npm to see if a package
 *  needs to be downloaded before running the `code` / invoking the component
 */
export async function compileJS(
  code: string,
  extraModules?: Record<string, unknown>
): Promise<CompileResult> {
  let name = nameFor(code);
  let component: undefined | ComponentLike;
  let error: undefined | Error;

  try {
    let compiled = await transpile({ code: code, name });

    if (!compiled) {
      throw new Error(`Compiled output is missing`);
    }

    component = evalSnippet(compiled, extraModules).default as unknown as ComponentLike;
  } catch (e) {
    error = e as Error | undefined;
  }

  return { name, component, error };
}

async function transpile({ code: input, name }: Info) {
  let preprocessed = await preprocess(input, name);
  let result = await transform(preprocessed, name);

  if (!result) {
    return;
  }

  let { code } = result;

  return code;
}

import type { Babel } from './babel.ts';

let processor: any;
let fetchingPromise: Promise<any>;

async function preprocess(input: string, name: string): Promise<string> {
  if (!fetchingPromise) {
    fetchingPromise = import('content-tag');
  }

  if (!processor) {
    let { Preprocessor } = await fetchingPromise;

    processor = new Preprocessor();
  }

  return processor.process(input, { filename: `${name}.js`, inline_source_map: true });
}

async function transform(
  intermediate: string,
  name: string,
  options: any = {}
): Promise<ReturnType<Babel['transform']>> {
  // @babel/standalone is a CJS module....
  // so we have to use the default export (which is all the exports)
  let maybeBabel = (await import('@babel/standalone')) as any;
  // Handle difference between vite and webpack in consuming projects...
  let babel: Babel = 'availablePlugins' in maybeBabel ? maybeBabel : maybeBabel.default;

  return babel.transform(intermediate, {
    filename: `${name}.js`,
    plugins: [
      // [babelPluginIntermediateGJS],
      [
        babelPluginEmberTemplateCompilation,
        {
          compiler,
        },
      ],
      [babel.availablePlugins['proposal-decorators'], { legacy: true }],
      [babel.availablePlugins['proposal-class-properties']],
    ],
    presets: [
      [
        babel.availablePresets['env'],
        {
          // false -- keeps ES Modules
          modules: 'cjs',
          targets: { esmodules: true },
          forceAllTransforms: false,
          ...options,
        },
      ],
    ],
  });
}
