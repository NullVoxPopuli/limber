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

  return templates.output || 'error from ember-template-tag';
}

export async function transform(
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
