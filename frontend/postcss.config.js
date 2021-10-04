'use strict';

const config = require('./tailwind.config');
const tailwindcss = require('@tailwindcss/jit')('./tailwind.config.js');

module.exports = {
  plugins: [
    'postcss-preset-env',
    tailwindcss
  ],
};
