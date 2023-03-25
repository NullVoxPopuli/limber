import { getTemplateLocals } from '@glimmer/syntax';

import HTMLBars, { preprocessEmbeddedTemplates } from 'babel-plugin-htmlbars-inline-precompile';
import { precompile as precompileTemplate } from 'ember-template-compiler';

import { nameFor } from '../utils';
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

  let preprocessed = preprocessEmbeddedTemplates(input, {
    getTemplateLocals,
    relativePath: `${name}.js`,
    includeSourceMaps: false,
    includeTemplateTokens: true,
    templateTag: 'template',
    templateTagReplacement: 'GLIMMER_TEMPLATE',
    getTemplateLocalsExportPath: 'getTemplateLocals',
  });

  let result = babel.transform(preprocessed.output, {
    filename: `${name}.js`,
    plugins: [
      [
        HTMLBars,
        {
          precompile: precompileTemplate,
          // this needs to be true until Ember 3.27+
          ensureModuleApiPolyfill: false,
          modules: {
            'ember-template-imports': {
              export: 'hbs',
              useTemplateLiteralProposalSemantics: 1,
            },

            'TEMPLATE-TAG-MODULE': {
              export: 'GLIMMER_TEMPLATE',
              debugName: '<template>',
              useTemplateTagProposalSemantics: 1,
            },
          },
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
          loose: true,
          forceAllTransforms: false,
        },
      ],
    ],
  });

  if (!result) {
    return;
  }

  let { code } = result;

  return code;
}
