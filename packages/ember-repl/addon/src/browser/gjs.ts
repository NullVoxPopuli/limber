import { importSync } from '@embroider/macros';

import babelPluginEmberTemplateCompilation from 'babel-plugin-ember-template-compilation';

import type { Babel } from './types.ts';

const compiler = importSync('ember-source/dist/ember-template-compiler.js');

import { TEMPLATE_TAG_NAME, transform as ettTransform } from 'ember-template-tag';

export function preprocess(input: string, name: string) {
  let templates = ettTransform({
    input,
    relativePath: `${name}.js`,
    includeSourceMaps: false,
    templateTag: TEMPLATE_TAG_NAME,
  });

  if (!templates.output) {
    throw new Error('Failed to transform gjs');
  }

  return templates.output;
}

export async function transform(
  intermediate: string,
  name: string,
  options: any = {}
): Promise<ReturnType<Babel['transform']>> {
  let { transform: babelTransform } = await import("@babel/core") as Babel;
  let [decorators, classProperties] = await Promise.all([
    import('@babel/plugin-proposal-decorators'),
    import('@babel/plugin-proposal-class-properties'),
    // import('@babel/preset-env'),
  ]);

  return babelTransform(intermediate, {
    filename: `${name}.js`,
    plugins: [
      // [babelPluginIntermediateGJS],
      [
        babelPluginEmberTemplateCompilation.default,
        {
          compiler,
        },
      ],
      [decorators.default, { legacy: true }],
      [classProperties.default],
    ],
    presets: [
      // [
      //   env.default,
      //   {
      //     // false -- keeps ES Modules
      //     modules: 'cjs',
      //     targets: { esmodules: true },
      //     forceAllTransforms: false,
      //     ...options,
      //   },
      // ],
    ],
  });
}
