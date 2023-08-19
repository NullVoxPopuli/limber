import { importSync } from '@embroider/macros';

import babelPluginEmberTemplateCompilation from 'babel-plugin-ember-template-compilation';

// TODO: use real packages, and not these copied files from ember-template-imports
import babelPluginIntermediateGJS from './eti/babel-plugin.ts';
import { preprocessEmbeddedTemplates } from './eti/preprocess.ts';
import { TEMPLATE_TAG_NAME, TEMPLATE_TAG_PLACEHOLDER } from './eti/util.ts';

import type { Babel } from './types.ts';

const compiler = importSync('ember-source/dist/ember-template-compiler.js');

export function preprocess(input: string, name: string) {
  let preprocessed = preprocessEmbeddedTemplates(input, {
    relativePath: `${name}.js`,
    includeSourceMaps: false,
    includeTemplateTokens: true,
    templateTag: TEMPLATE_TAG_NAME,
    templateTagReplacement: TEMPLATE_TAG_PLACEHOLDER,
  });

  return preprocessed.output;
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
      [babelPluginIntermediateGJS],
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
