/**
 * This babel.config is used for linting only
 */
module.exports = {
  plugins: [
    [
      'module:decorator-transforms',
      {
        runtime: {
          import: require.resolve('decorator-transforms/runtime-esm'),
        },
      },
    ],
  ],

  generatorOpts: {
    compact: false,
  },
};
