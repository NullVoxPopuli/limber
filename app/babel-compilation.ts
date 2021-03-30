import { compileTemplate } from '@ember/template-compilation';

import * as Babel from '@babel/standalone';
// import BabelDecorators from '@babel/plugin-proposal-decorators';
// import BabelEnv from '@babel/preset-env';
import { transform } from '@babel/standalone';
import HtmlbarsPrecompile from 'babel-plugin-htmlbars-inline-precompile';

import type { ExtractedCode } from 'limber/services//-compile/markdown-to-ember';

// const babelOptions = {};

/**
 * Inspiration?
 *
 * https://github.com/glimmerjs/glimmer-experimental/blob/master/packages/examples/playground/src/utils/eval-snippet.ts
 *
 * NOTE: ember-template-imports requires
 *       babel-plugin-htmlbars-inline-precompile, which requires
 *       "path", which doesn't exist in a browser
 */
export async function compileGJS({ code: input, name }: ExtractedCode) {
  let result = transform(input, {
    filename: `${name}.js`,
    plugins: [
      [
        HtmlbarsPrecompile,
        {
          isProduction: false,
          precompile: compileTemplate,
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
      [Babel.availablePlugins['proposal-decorators'], { legacy: true }],
    ],
    presets: [
      // [
      //   {
      //     precompile: compileTemplate,
      //     __loadPlugins: true,
      //     __customInlineTemplateModules: {
      //       'TEMPLATE-TAG-MODULE': {
      //         export: 'GLIMMER_TEMPLATE',
      //         debugName: '<template>',
      //         useTemplateTagProposalSemantics: 1,
      //       },
      //     },
      //   },
      // ],
      [
        Babel.availablePresets['env'],
        {
          targets: [
            'last 1 Edge versions',
            'last 1 Chrome versions',
            'last 1 Firefox versions',
            'last 1 Safari versions',
          ],
        },
      ],
    ],
  });

  if (!result) {
    return;
  }

  let { code } = result;

  console.log({ code });

  return code;
}
