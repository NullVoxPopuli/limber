'use strict';

const config = require('./tailwind.config');
const tailwindcss = require('@tailwindcss/jit')(config);

module.exports = {
  plugins: [
    'postcss-preset-env',
    tailwindcss
  ],
};
