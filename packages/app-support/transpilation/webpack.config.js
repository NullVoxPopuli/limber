'use strict';

const webpack = require('webpack');

module.exports = {
  mode: process.env.PRODUCTION != null ? 'production' : 'development',
  entry: {
    worker: './src/index.ts',
  },
  target: 'webworker',
  devtool: process.env.PRODUCTION != null ? false : 'inline-source-map',
  plugins: [
    new webpack.ProvidePlugin({
      process: 'process',
      Buffer: 'buffer',
    }),
  ],
  module: {
    rules: [
      {
        test: /\.ts$/i,
        use: ['babel-loader'],
      },
    ],
  },
  output: {
    filename: 'limber-[name].js',
  },
  resolve: {
    extensions: ['.ts', '.js', '.json'],
    fallback: {
      fs: false,
      path: require.resolve('path-browserify'),
      '@ember/template-compilation': require.resolve(
        'ember-source/dist/ember-template-compiler.js'
      ),
    },
    alias: {
      // this prevents complaining about require.extensions
      // handlebars: 'handlebars/dist/cjs/handlebars.js',
    },
  },
};
