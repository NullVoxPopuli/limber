import { getTemplateLocals } from '@glimmer/syntax';
import { compileTemplate } from '@ember/template-compilation';

import * as Babel from '@babel/standalone';
// // import BabelDecorators from '@babel/plugin-proposal-decorators';
// // import BabelEnv from '@babel/preset-env';
import HtmlbarsPrecompile from 'babel-plugin-htmlbars-inline-precompile';

import type { ExtractedCode } from 'limber/services/-compile/markdown-to-ember';

export async function compileGJS({ code: input, name }: ExtractedCode) {
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
    ],
    presets: [
      [
        Babel.availablePresets['env'],
        {
          modules: false, // preserves?
        },
      ],
    ],
  });

  if (!result) {
    return;
  }

  let { code } = result;

  // yolo
  // console.log(code);
  // console.log(eval(code));

  return code;
}
