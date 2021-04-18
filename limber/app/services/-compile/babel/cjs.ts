import _Component from '@glimmer/component';
import { getTemplateLocals } from '@glimmer/syntax';
import { tracked } from '@glimmer/tracking';
import { compileTemplate } from '@ember/template-compilation';

import * as Babel from '@babel/standalone';
import HtmlbarsPrecompile from 'babel-plugin-htmlbars-inline-precompile';

import type Component from '@glimmer/component';

interface Info {
  code: string;
  name: string;
}

export async function compile(js: Info[]) {
  let rawCode = await Promise.all(
    js.map(async ({ name, code }) => {
      let compiled = await compileGJS({ code, name });

      return { name, code: compiled } as Info;
    })
  );

  let modules = rawCode.map((info) => ({ name: info.name, ...evalSnippet(info.code) }));

  return modules;
}

const modules = {
  '@glimmer/component': _Component,
  '@glimmer/tracking': { tracked },
};

// https://github.com/glimmerjs/glimmer-experimental/blob/master/packages/examples/playground/src/utils/eval-snippet.ts
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function require(moduleName: keyof typeof modules): unknown {
  return modules[moduleName];
}

export function evalSnippet(
  compiled: string
): { default: Component; services?: { [key: string]: unknown } } {
  const exports = {};

  eval(compiled);

  console.log(compiled, { exports });

  return exports as { default: Component; services?: { [key: string]: unknown } };
}

async function compileGJS({ code: input, name }: Info) {
  let preprocessed = HtmlbarsPrecompile.preprocessEmbeddedTemplates(input, {
    getTemplateLocals,
    relativePath: 'some-name.js',
    includeSourceMaps: false,
    includeTemplateTokens: true,
    templateTag: 'template',
    templateTagReplacement: 'GLIMMER_TEMPLATE',
    getTemplateLocalsExportPath: 'getTemplateLocals',
  });

  let result = Babel.transform(preprocessed.output, {
    filename: `${name}.js`,
    plugins: [
      [
        HtmlbarsPrecompile,
        {
          isProduction: false,
          precompile: compileTemplate,
          modules: {
            // 'ember-template-imports': {
            //   export: 'hbs',
            //   useTemplateLiteralProposalSemantics: 1,
            // },

            'TEMPLATE-TAG-MODULE': {
              export: 'GLIMMER_TEMPLATE',
              debugName: '<template>',
              useTemplateTagProposalSemantics: 1,
            },
          },
        },
      ],
      [Babel.availablePlugins['proposal-decorators'], { legacy: true }],
      [Babel.availablePlugins['proposal-class-properties']],

      // [Babel.availablePlugins['transform-modules-commonjs'], { loose: true }],
    ],
    presets: [
      [
        Babel.availablePresets['env'],
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
