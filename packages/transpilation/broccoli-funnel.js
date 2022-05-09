'use strict';

const path = require('path');
const Funnel = require('broccoli-funnel');

const SRC_FILES = path.join(__dirname, 'dist');

/**
 * This broccoli funnel is for copying the built assets to a target
 * app's public folder. No building occurs
 *
 */
module.exports = function distWatcher() {
  return new Funnel(SRC_FILES, {
    // dist or whatever the root of the output directory is
    destDir: '/',
  });
};
