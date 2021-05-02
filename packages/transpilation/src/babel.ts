import { precompile } from '@glimmer/compiler';
import { getTemplateLocals } from '@glimmer/syntax';

import * as Babel from '@babel/standalone';
import HtmlbarsPrecompile from 'babel-plugin-htmlbars-inline-precompile';

interface Info {
  code: string;
  name: string;
}

export async function compileGJS({ code: input, name }: Info) {
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
          precompile,
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

  return code;
}
