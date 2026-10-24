/**
 * This babel.config is not used for publishing.
 * It's only for the local editing experience
 * (and linting)
 */
const { buildMacros } = require('@embroider/macros/babel');

const macros = buildMacros();

/**
 * For scenario testing.
 * Only the compat scenarios install @embroider/compat.
 */
const isCompat = Boolean(process.env.ENABLE_COMPAT_BUILD);
// eslint-disable-next-line n/no-missing-require
const compat = isCompat ? require('@embroider/compat/babel') : undefined;

module.exports = {
  plugins: [
    [
      '@babel/plugin-transform-typescript',
      {
        allExtensions: true,
        allowDeclareFields: true,
        onlyRemoveTypeImports: true,
      },
    ],
    [
      'babel-plugin-ember-template-compilation',
      {
        transforms: [
          ...(isCompat
            ? compat.templateCompatSupport()
            : macros.templateMacros),
        ],
      },
    ],
    [
      'module:decorator-transforms',
      {
        runtime: {
          import: require.resolve('decorator-transforms/runtime-esm'),
        },
      },
    ],
    ...(isCompat ? compat.babelCompatSupport() : macros.babelMacros),
  ],

  generatorOpts: {
    compact: false,
  },
};
