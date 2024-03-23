// eslint-disable-next-line n/no-missing-require
let config = require('./node_modules/.embroider/rewritten-app/_babel_config_');

module.exports = {
  ...config,
  presets: [
    [
      '@babel/preset-env',
      {
        useBuiltIns: 'entry',
        corejs: '3.22',
      },
    ],
  ],
};

// console.log(module.exports);
