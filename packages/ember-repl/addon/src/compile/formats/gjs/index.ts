import { importSync } from '@embroider/macros';

import babelPluginEmberTemplateCompilation from 'babel-plugin-ember-template-compilation';

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

const compiler = importSync('ember-source/dist/ember-template-compiler.js');

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

  return processor.process(input, `${name}.js`);
}

async function transform(
  intermediate: string,
  name: string,
  options: any = {}
): Promise<ReturnType<Babel['transform']>> {
  let babel = (await import('@babel/standalone')) as Babel;

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
      // See: https://github.com/NullVoxPopuli/limber/issues/1671
      //     for just how bad the babel plugins are
      //     (grow your code by 20%!)
      // [babel.availablePlugins['proposal-decorators'], { legacy: true }],
      // [babel.availablePlugins['proposal-class-properties']],
      [
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore - we don't care about types here..
        await import('decorator-transforms'),
        {
          runtime: {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore - we don't care about types here..
            import: await import('decorator-transforms/runtime'),
          },
        },
      ],
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
