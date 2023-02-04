'use strict';

const path = require('path');
const Funnel = require('broccoli-funnel');

const COMPILED_FILES = path.join(__dirname, 'dist');

/**
 * This broccoli funnel is for copying the built assets to a target
 * app's public folder. No building occurs
 *
 */
module.exports = function codemirrorFunnel() {
  return new Funnel(COMPILED_FILES, {
    destDir: 'codemirror/',
  });
};
