// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import * as compiler from 'ember-source/dist/ember-template-compiler.js';

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
  const name = nameFor(code);
  let component: undefined | ComponentLike;
  let error: undefined | Error;

  try {
    const compiled = await transpile({ code: code, name });

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
  const preprocessed = await preprocess(input, name);
  const result = await transform(preprocessed, name);

  if (!result) {
    return;
  }

  const { code } = result;

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
    const { Preprocessor } = await fetchingPromise;

    processor = new Preprocessor();
  }

  const { code /* map */ } = processor.process(input, {
    filename: `${name}.js`,
    inline_source_map: true,
  });

  return code;
}

async function transform(
  intermediate: string,
  name: string
): Promise<ReturnType<Babel['transform']>> {
  const [
    // _parser, _traverse, _generator,
    _decoratorTransforms,
    _emberTemplateCompilation,
  ] = await Promise.all([
    // @babel/* doesn't have the greatest ESM compat yet
    // https://github.com/babel/babel/issues/14314#issuecomment-1054505190
    //
    // babel-standalone is so easy...
    // import('@babel/parser'),
    // import('@babel/traverse'),
    // import('@babel/generator'),
    import('decorator-transforms'),
    import('babel-plugin-ember-template-compilation'),
  ]);

  // These libraries are compiled incorrectly for cjs<->ESM compat
  const decoratorTransforms =
    'default' in _decoratorTransforms ? _decoratorTransforms.default : _decoratorTransforms;

  const emberTemplateCompilation =
    'default' in _emberTemplateCompilation
      ? _emberTemplateCompilation.default
      : _emberTemplateCompilation;

  // so we have to use the default export (which is all the exports)
  const maybeBabel = (await import('@babel/standalone')) as any;
  // Handle difference between vite and webpack in consuming projects...
  const babel: Babel = 'availablePlugins' in maybeBabel ? maybeBabel : maybeBabel.default;

  return babel.transform(intermediate, {
    filename: `${name}.js`,
    plugins: [
      [
        emberTemplateCompilation,
        {
          compiler,
        },
      ],
      [
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore - we don't care about types here..
        decoratorTransforms,
        {
          runtime: {
            import: 'decorator-transforms/runtime',
          },
        },
      ],
      // Womp.
      // See this exploration into true ESM:
      //   https://github.com/NullVoxPopuli/limber/pull/1805
      [babel.availablePlugins['transform-modules-commonjs']],
    ],
    presets: [],
  });
}
