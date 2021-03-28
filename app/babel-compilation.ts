import glimmerPreset from '@glimmer/babel-preset';
import { compileTemplate } from '@ember/template-compilation';

import { transformAsync } from '@babel/core';

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
  let result = await transformAsync(input, {
    filename: `${name}.js`,
    presets: [
      [
        glimmerPreset,
        {
          precompile: compileTemplate,
          __loadPlugins: true,
          __customInlineTemplateModules: {
            'TEMPLATE-TAG-MODULE': {
              export: 'GLIMMER_TEMPLATE',
              debugName: '<template>',
              useTemplateTagProposalSemantics: 1,
            },
          },
        },
      ],
      [
        'env',
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
