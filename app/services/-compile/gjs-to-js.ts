import { transform } from '@babel/standalone';

// const babelOptions = {};

/**
 * Inspiration?
 *
 * https://github.com/glimmerjs/glimmer-experimental/blob/master/packages/examples/playground/src/utils/eval-snippet.ts
 *
 */
export function compileGJS(input: string) {
  let { code } = transform(input, { presets: ['env'] });
  // console.log({ code });

  return code;
}
