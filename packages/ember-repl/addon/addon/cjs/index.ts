// import { precompileTemplate } from 'ember-template-compiler';
// TODO: use real packages, and not these copied files from ember-template-imports
import babelPluginEmberTemplateCompilation from 'babel-plugin-ember-template-compilation';
import * as compiler from 'ember-template-compiler';

import { nameFor } from '../utils';
import babelPluginIntermediateGJS from './eti/babel-plugin';
import { preprocessEmbeddedTemplates } from './eti/preprocess';
import { TEMPLATE_TAG_NAME, TEMPLATE_TAG_PLACEHOLDER } from './eti/util';
import { evalSnippet } from './eval';

import type { Babel, ExtraModules } from '../types';

export interface Info {
  code: string;
  name: string;
}

export async function compileJS(code: string, extraModules?: ExtraModules) {
  let name = nameFor(code);
  let component: undefined | unknown;
  let error: undefined | Error;

  try {
    let compiled = await compileGJS({ code: code, name });

    if (!compiled) {
      throw new Error(`Compiled output is missing`);
    }

    component = evalSnippet(compiled, extraModules).default;
  } catch (e) {
    error = e;
  }

  return { name, component, error };
}

let babel: Babel;

async function compileGJS({ code: input, name }: Info) {
  if (!babel) {
    babel = await import('@babel/standalone');
  }

  let preprocessed = preprocess(input, name);
  let result = transformIntermediate(preprocessed, name);

  if (!result) {
    return;
  }

  let { code } = result;

  return code;
}

function preprocess(input: string, name: string) {
  let preprocessed = preprocessEmbeddedTemplates(input, {
    relativePath: `${name}.js`,
    includeSourceMaps: false,
    includeTemplateTokens: true,
    templateTag: TEMPLATE_TAG_NAME,
    templateTagReplacement: TEMPLATE_TAG_PLACEHOLDER,
  });

  return preprocessed.output;
}

function transformIntermediate(intermediate: string, name: string) {
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
        },
      ],
    ],
  });
}
