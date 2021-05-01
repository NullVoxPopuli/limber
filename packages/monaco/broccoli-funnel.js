'use strict';

const path = require('path');
const Funnel = require('broccoli-funnel');

const SRC_FILES = path.join(__dirname, 'dist');

/**
  * This broccoli funnel is for copying the built assets to a target
  * app's public folder. No building occurs
  *
  */
module.exports = function monacoFunnel() {
  return new Funnel(SRC_FILES, {
    destDir: 'monaco/'
  });
}
