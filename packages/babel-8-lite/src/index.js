/**
 * The same shape as `@babel/standalone`, so either one works for the compilers of repl-sdk.
 *
 * `@babel/standalone` has every plugin and preset of Babel, the unicode tables
 * for regex transforms, and the data of preset-env. It is about twice the size.
 */
import transformTypescript from '@babel/plugin-transform-typescript';
import presetReact from '@babel/preset-react';

export { parse, transformAsync, transformSync, version } from '@babel/core';
// In `@babel/standalone`, `transform` is synchronous. In `@babel/core` 8 it needs a callback.
export { transformSync as transform } from '@babel/core';

export const availablePlugins = {
  'transform-typescript': transformTypescript,
};

export const availablePresets = {
  react: presetReact,
};
